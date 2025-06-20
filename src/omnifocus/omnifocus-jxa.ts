// Utility for building JXA scripts and parsing results for OmniFocus automation

export function buildJxaScriptForTasks(activeOnly: boolean): string {
  return `
    (() => {
      const app = Application('OmniFocus');
      app.includeStandardAdditions = true;
      const ofDoc = app.defaultDocument;
      function safe(obj, method) {
        try { return obj && typeof obj[method] === 'function' ? obj[method]() : null; } catch { return null; }
      }
      function getContext(task) {
        const ctx = safe(task, 'context');
        return ctx ? { id: safe(ctx, 'id'), name: safe(ctx, 'name') } : null;
      }
      function getProject(task) {
        const proj = safe(task, 'containingProject');
        return proj ? { id: safe(proj, 'id'), name: safe(proj, 'name') } : null;
      }
      function isInTemplatesFolder(project) {
        let folder = safe(project, 'folder');
        while (folder) {
          if (safe(folder, 'name') === 'Templates') return true;
          folder = safe(folder, 'parentFolder');
        }
        return false;
      }
      function isExcludedTask(task) {
        const name = safe(task, 'name') || '';
        const note = safe(task, 'note') || '';
        if (name.includes('«') || name.includes('»') || note.includes('«') || note.includes('»')) return true;
        if (name.includes('⚙️') || note.includes('⚙️')) return true;
        const proj = safe(task, 'containingProject');
        if (!proj) return false;
        return isInTemplatesFolder(proj);
      }
      function getTaskData(task) {
        return {
          id: safe(task, 'id'),
          name: safe(task, 'name'),
          note: safe(task, 'note'),
          completed: safe(task, 'completed'),
          status: safe(task, 'status'),
          completionDate: safe(task, 'completionDate') ? safe(task, 'completionDate').toISOString() : null,
          creationDate: safe(task, 'creationDate') ? safe(task, 'creationDate').toISOString() : null,
          modificationDate: safe(task, 'modificationDate') ? safe(task, 'modificationDate').toISOString() : null,
          dueDate: safe(task, 'dueDate') ? safe(task, 'dueDate').toISOString() : null,
          deferDate: safe(task, 'deferDate') ? safe(task, 'deferDate').toISOString() : null,
          estimatedMinutes: safe(task, 'estimatedMinutes'),
          flagged: safe(task, 'flagged'),
          repetitionRule: safe(task, 'repetitionRule'),
          sequential: safe(task, 'sequential'),
          project: safe(task, 'project'),
          context: getContext(task),
          containingProject: getProject(task)
        };
      }
      const allTasks = Array.from(ofDoc.flattenedTasks());
      const filteredTasks = allTasks.filter(task => {
        if (isExcludedTask(task)) return false;
        const statusObj = safe(task, 'status') ? task.status() : null;
        const statusName = statusObj ? safe(statusObj, 'name') : '';
        if (${activeOnly ? 'true' : 'false'}) {
          // Exclude completed or dropped tasks
          return !task.completed() && !/dropped/i.test(statusName);
        }
        return true;
      });
      const result = filteredTasks.map(getTaskData);
      return JSON.stringify(result);
    })();
  `;
}

export function buildJxaScriptForProjects(activeOnly: boolean): string {
  return `
    (() => {
      const app = Application('OmniFocus');
      app.includeStandardAdditions = true;
      const ofDoc = app.defaultDocument;
      function safe(obj, method) {
        try { return obj && typeof obj[method] === 'function' ? obj[method]() : null; } catch { return null; }
      }
      function isInTemplatesFolder(project) {
        let folder = safe(project, 'folder');
        while (folder) {
          if (safe(folder, 'name') === 'Templates') return true;
          folder = safe(folder, 'parentFolder');
        }
        return false;
      }
      function isExcludedProject(project) {
        const name = safe(project, 'name') || '';
        if (name.includes('«') || name.includes('»')) return true;
        if (name.includes('⚙️')) return true;
        return isInTemplatesFolder(project);
      }
      function getProjectData(project) {
        return {
          id: safe(project, 'id'),
          name: safe(project, 'name'),
          note: safe(project, 'note'),
          completed: safe(project, 'completed'),
          status: safe(project, 'status'),
          flagged: safe(project, 'flagged'),
          folder: (function() {
            const folder = safe(project, 'folder');
            return folder ? { id: safe(folder, 'id'), name: safe(folder, 'name') } : null;
          })(),
        };
      }
      const allProjects = Array.from(ofDoc.flattenedProjects());
      const filteredProjects = allProjects.filter(project => {
        if (isExcludedProject(project)) return false;
        // No activeOnly filtering here; always return all projects
        return true;
      });
      const result = filteredProjects.map(getProjectData);
      return JSON.stringify(result);
    })();
  `;
} 