import { ThreePerf } from 'three-perf';
import DebugGUI from './DebugGUI.class';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import Game from '../Game.class';

export default class PerformanceMonitor {
  constructor(renderer) {
    this.game = Game.getInstance();
    this.renderer = renderer;
    this.debugGUI = this.game.debug;
    this.isDebugMode = this.game.isDebugMode;

    this.stats = new ThreePerf({
      domElement: document.body,
      renderer: this.renderer,
      showGraph: false,
      memory: true,
      anchorX: 'left',
      anchorY: 'top',
    });
    this.statsNative = new Stats();
    this.statsNative.dom.style.top = '70px';
    document.body.append(this.statsNative.dom);

    if (this.isDebugMode) {
      this.debugGUI.addFolder('Performance');
      this.debugGUI.add(
        this.stats,
        'showGraph',
        { label: 'Graph' },
        'Performance'
      );
    }
  }

  beginFrame() {
    if (this.stats.enabled) this.stats.begin();
  }

  endFrame() {
    if (this.stats.enabled) this.stats.end();
    this.statsNative.update();
  }
}
