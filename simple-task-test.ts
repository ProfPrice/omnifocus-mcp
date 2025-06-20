#!/usr/bin/env node

import { execSync } from 'child_process';
import { OmniFocusClient } from './src/omnifocus/client.ts';

// Test a much simpler version of task retrieval
console.log('Testing simple OmniFocus task retrieval...\n');

try {
  // Test 1: Just count tasks
  console.log('Test 1: Count all tasks');
  const countScript = `
    (() => {
      const app = Application('OmniFocus');
      const doc = app.defaultDocument;
      const allTasks = doc.flattenedTasks();
      return allTasks.length;
    })()
  `;
  
  const count = execSync(`osascript -l JavaScript -e "${countScript.replace(/"/g, '\\"')}"`, { encoding: 'utf8' }).trim();
  console.log(`✅ Total tasks: ${count}\n`);

  // Test 2: Get just names of first 3 tasks
  console.log('Test 2: Get first 3 task names');
  const namesScript = `
    (() => {
      const app = Application('OmniFocus');
      const doc = app.defaultDocument;
      const allTasks = doc.flattenedTasks();
      const names = [];
      const limit = Math.min(3, allTasks.length);
      
      for (let i = 0; i < limit; i++) {
        const task = allTasks[i];
        names.push(String(task.name()));
      }
      
      return JSON.stringify(names);
    })()
  `;
  
  const names = execSync(`osascript -l JavaScript -e "${namesScript.replace(/"/g, '\\"')}"`, { encoding: 'utf8' }).trim();
  console.log(`✅ First 3 task names: ${names}\n`);

  // Test 3: Get basic info for one task
  console.log('Test 3: Get basic info for first task');
  const basicScript = `
    (() => {
      const app = Application('OmniFocus');
      const doc = app.defaultDocument;
      const allTasks = doc.flattenedTasks();
      
      if (allTasks.length === 0) {
        return JSON.stringify({message: "No tasks found"});
      }
      
      const task = allTasks[0];
      const taskInfo = {
        name: String(task.name()),
        completed: Boolean(task.completed()),
        flagged: Boolean(task.flagged())
      };
      
      return JSON.stringify(taskInfo);
    })()
  `;
  
  const basicInfo = execSync(`osascript -l JavaScript -e "${basicScript.replace(/"/g, '\\"')}"`, { encoding: 'utf8' }).trim();
  console.log(`✅ First task info: ${basicInfo}\n`);

  console.log('🎉 All tests passed! OmniFocus automation is working.');
  console.log('The issue is likely in the complex task object construction in our client.');

} catch (error) {
  console.log('❌ Error:', error.message);
  console.log('\nThis suggests there might be an OmniFocus automation permissions issue.');
}

// Simple CLI test for OmniFocus MCP: List all tasks
async function main() {
  const client = new OmniFocusClient();
  const arg = process.argv[2];

  if (!arg || !['all-tasks', 'active-tasks', 'all-projects', 'active-projects'].includes(arg)) {
    console.log('Usage: npx ts-node simple-task-test.ts <all-tasks|active-tasks|all-projects|active-projects>');
    process.exit(1);
  }

  let items;
  if (arg === 'all-tasks') {
    items = await client.getAllTasks();
    console.log('All tasks:');
  } else if (arg === 'active-tasks') {
    items = await client.getActiveTasks();
    console.log('Active (uncompleted) tasks:');
  } else if (arg === 'all-projects') {
    items = await client.getAllProjects();
    console.log('All projects:');
  } else if (arg === 'active-projects') {
    items = await client.getActiveProjects();
    console.log('Active projects:');
  }

  for (const item of items) {
    if (arg.includes('task')) {
      console.log(`- [${item.completed ? 'x' : ' '}] ${item.name}`);
      if (item.dueDate) {
        console.log(`    Due: ${item.dueDate}`);
      }
      if (item.deferDate) {
        console.log(`    Defer: ${item.deferDate}`);
      }
      if (item.flagged) {
        console.log('    ⚑ Flagged');
      }
      if (item.containingProject) {
        console.log(`    Project: ${item.containingProject.name}`);
      }
      if (item.context) {
        console.log(`    Context: ${item.context.name}`);
      }
      if (item.note) {
        console.log(`    Note: ${item.note}`);
      }
      if (item.statusName) {
        console.log(`    Status: ${item.statusName}`);
      }
    } else {
      // project
      console.log(`- [${item.completed ? 'x' : ' '}] ${item.name}`);
      if (item.status) {
        console.log(`    Status: ${item.status}`);
      }
      if (item.statusName) {
        console.log(`    Status: ${item.statusName}`);
      }
      if (item.flagged) {
        console.log('    ⚑ Flagged');
      }
      if (item.folder) {
        console.log(`    Folder: ${item.folder.name}`);
      }
      if (item.note) {
        console.log(`    Note: ${item.note}`);
      }
    }
    console.log('');
  }

  // Print all unique statusName values for debugging
  const statusNames = Array.from(new Set(items.map(i => i.statusName).filter(Boolean)));
  if (statusNames.length) {
    console.log('Unique statusName values:');
    for (const s of statusNames) {
      console.log(`- ${s}`);
    }
  }
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});