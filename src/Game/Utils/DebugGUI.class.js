import GUI from 'lil-gui';
import * as THREE from 'three';

/**
 * DebugGUI: A wrapper around lil-gui that auto-detects control types and supports:
 *   • Numbers (sliders)
 *   • Booleans (checkboxes)
 *   • Colors (color pickers)
 *   • Enums / string lists (dropdowns)
 *   • Vector2 / Vector3 (grouped axis sliders)
 *
 * ? In main entry point for project
 * ? Add this.debug = new DebugGUI();
 * ? Later on while using anywhere in app use
 * ? this.debug = DebugGUI.getInstance();
 *
 * Usage examples:
 *
 * * Number slider:
 * debug.add(myMat.uniforms.uSpeed, "value", { min: 0, max: 10, step: 0.01, label: "Speed" }, "movement");
 *
 * * Boolean checkbox:
 * debug.add(Material, "wireframe", { label: "Enable Feature" }, "cubeFolder");
 *
 * * Color picker:
 * debug.add(myMat.uniforms.uColor, "value", { color: true, label: "Base Color" }, "cubeFolder");
 *
 * * Enum / dropdown:
 * this.debug.add( this.renderer, "toneMapping", { options: toneMappingOptions, label: "Tone Mapping", onChange: (v) => { this.renderer.toneMapping = v; },}, "Renderer Settings" );
 *
 * * Vector2:
 * debug.add(myObject.position2D, "position", { min: -5, max: 5, step: 0.1, label: "2D Position" }, "transform");
 *
 * * Vector3:
 * debug.add(myObject.position3D, "position", { min: -10, max: 10, step: 0.5, label: "3D Position" }, "transform");
 */
export default class DebugGUI {
  constructor() {
    // Singleton pattern - return existing instance if it exists
    if (DebugGUI.instance) {
      return DebugGUI.instance;
    }

    // Initialize your debug GUI here (dat.gui, lil-gui, etc.)
    // This is just an example structure
    this.gui = null;
    this.folders = new Map();
    this.controllers = new Map();

    // Store the instance
    DebugGUI.instance = this;

    this._initializeGUI();
  }

  _initializeGUI() {
    // Initialize your GUI library here
    // Example for lil-gui:
    this.gui = new GUI();
  }

  addFolder(name) {
    if (!this.folders[name]) {
      this.folders[name] = this.gui.addFolder(name);
    }
    this.folders[name].close();

    return this.folders[name];
  }

  add(targetObject, targetProperty, options = {}, folderName = null) {
    const controllerTarget = folderName ? this.addFolder(folderName) : this.gui;

    const value = targetObject[targetProperty];
    const label = options.label || targetProperty;

    // Vector2 / Vector3: grouped axis sliders
    if (value instanceof THREE.Vector2 || value instanceof THREE.Vector3) {
      const vecFolder = controllerTarget.addFolder(label);
      const axes = ['x', 'y', value instanceof THREE.Vector3 ? 'z' : null].filter(Boolean);

      axes.forEach((axis) => {
        const controller = vecFolder
          .add(
            value,
            axis,
            options.min !== undefined ? options.min : -1,
            options.max !== undefined ? options.max : 1,
            options.step !== undefined ? options.step : 0.01
          )
          .name(axis);

        // Call options.onChange with the full vector whenever an axis changes
        if (typeof options.onChange === 'function') {
          controller.onChange(() => {
            try {
              options.onChange(value);
            } catch (err) {
              console.warn('DebugGUI: vector onChange threw', err);
            }
          });
        }
      });

      return vecFolder;
    }

    // Plain object vector case: {x,y} or {x,y,z}
    const isPlainVec =
      value &&
      typeof value === 'object' &&
      ('x' in value && 'y' in value);

    if (isPlainVec) {
      const vecFolder = controllerTarget.addFolder(label);
      const axes = ['x', 'y', 'z'].filter((a) => a in value);

      axes.forEach((axis) => {
        const controller = vecFolder
          .add(
            value,
            axis,
            options.min !== undefined ? options.min : -1,
            options.max !== undefined ? options.max : 1,
            options.step !== undefined ? options.step : 0.01
          )
          .name(axis);

        if (typeof options.onChange === 'function') {
          controller.onChange(() => {
            try {
              options.onChange(value);
            } catch (err) {
              console.warn('DebugGUI: plain-vector onChange threw', err);
            }
          });
        }
      });

      return vecFolder;
    }

    // Enum / dropdown: support both arrays and objects
    if (options.options && typeof options.options === 'object') {
      const controller = controllerTarget.add(
        targetObject,
        targetProperty,
        options.options
      );
      controller.name(label);
      if (typeof options.onChange === 'function')
        controller.onChange(options.onChange);
      return controller;
    }

    // Boolean: checkbox
    if (typeof value === 'boolean') {
      const controller = controllerTarget
        .add(targetObject, targetProperty)
        .name(label);
      if (typeof options.onChange === 'function')
        controller.onChange(options.onChange);
      return controller;
    }

    // Color detection
    const isColor =
      options.color ||
      value instanceof THREE.Color ||
      typeof value === 'string';

    let controller;
    if (isColor) {
      // Color picker
      controller = controllerTarget.addColor(targetObject, targetProperty);
    } else {
      // Number slider
      controller = controllerTarget.add(
        targetObject,
        targetProperty,
        options.min,
        options.max,
        options.step
      );
    }

    controller.name(label);
    if (typeof options.onChange === 'function')
      controller.onChange(options.onChange);
    return controller;
  }

  // Static method to get the singleton instance
  static getInstance() {
    if (!DebugGUI.instance) {
      DebugGUI.instance = new DebugGUI();
    }
    return DebugGUI.instance;
  }

  // Method to destroy the singleton (useful for cleanup)
  static destroy() {
    if (DebugGUI.instance) {
      // Clean up GUI
      if (DebugGUI.instance.gui) {
        DebugGUI.instance.gui.destroy();
      }
      DebugGUI.instance = null;
    }
  }

  setEnabled(enabled) {
    if (this.gui && this.gui.domElement) {
      this.gui.domElement.style.display = enabled ? 'block' : 'none';
    }
  }
}
