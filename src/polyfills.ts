// Polyfills for isomorphic-git to work in the browser
import { Buffer } from 'buffer';
import process from 'process';

// Make Buffer available globally
if (typeof window !== 'undefined') {
  (window as any).Buffer = Buffer;
  (window as any).process = process;
}

// Ensure global is available
if (typeof global === 'undefined') {
  (window as any).global = window;
} 