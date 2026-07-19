import os from 'node:os';
import path from 'node:path';

console.log('Hello from Node.js!');
console.log(`Platform: ${os.platform()}`);
console.log(`Node version: ${process.version}`);
console.log(`CPUs: ${os.cpus().length}`);
console.log(`Current directory: ${path.resolve('.')}`);

console.log('\nEvent-loop ordering demo:');
console.log('1. synchronous start');
setTimeout(() => console.log('4. timer callback'), 0);
Promise.resolve().then(() => console.log('3. promise microtask'));
console.log('2. synchronous end');
