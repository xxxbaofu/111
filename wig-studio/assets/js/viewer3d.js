// Three.js 驱动的 3D 查看器：程序化生成一个头模 + 发丝 Mesh。
// 不依赖任何外部 3D 模型资源，页面加载即可渲染。
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/controls/OrbitControls.js';

export class WigViewer3D {
  constructor(container, options = {}) {
    this.container = container;
    this.options = Object.assign({
      background: 0xF5EBE6,
      hairColor: '#3b2418',
      style: 'straight',
      length: 40,        // cm
      density: 1.0,      // 0..1.5
      autoRotate: true,
    }, options);

    this._init();
    this._buildHead();
    this.setHair(this.options);
    this._animate();
    this._handleResize();
  }

  _init() {
    const { clientWidth: w, clientHeight: h } = this.container;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(this.options.background);

    this.camera = new THREE.PerspectiveCamera(35, Math.max(w/h, 0.1), 0.1, 100);
    this.camera.position.set(0, 0.2, 2.8);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(w, h);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.domElement.classList.add('three-canvas');
    this.container.appendChild(this.renderer.domElement);

    // 灯光
    const key = new THREE.DirectionalLight(0xffffff, 2.2);
    key.position.set(2, 3, 4);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    this.scene.add(key);

    const rim = new THREE.DirectionalLight(0xc8b6ff, 1.2);
    rim.position.set(-3, 2, -2);
    this.scene.add(rim);

    const fill = new THREE.HemisphereLight(0xffe0d0, 0x7a5678, 0.7);
    this.scene.add(fill);

    // 地面阴影
    const ground = new THREE.Mesh(
      new THREE.CircleGeometry(2, 48),
      new THREE.ShadowMaterial({ opacity: 0.12 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -1.1;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // 控制器
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.minDistance = 1.8;
    this.controls.maxDistance = 4.2;
    this.controls.minPolarAngle = Math.PI * 0.25;
    this.controls.maxPolarAngle = Math.PI * 0.7;
    this.controls.autoRotate = !!this.options.autoRotate;
    this.controls.autoRotateSpeed = 1.2;
    this.controls.target.set(0, 0.1, 0);
  }

  _buildHead() {
    this.headGroup = new THREE.Group();
    this.scene.add(this.headGroup);

    // 皮肤材质
    const skinMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#f4dbc2'),
      roughness: 0.55,
      clearcoat: 0.2,
      clearcoatRoughness: 0.8,
      sheen: 0.2,
      sheenColor: new THREE.Color('#c89'),
    });

    // 头部 —— 略拉长的椭球
    const headGeom = new THREE.SphereGeometry(0.55, 64, 64);
    // 稍微压扁前后
    const pos = headGeom.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i);
      const x = pos.getX(i);
      const z = pos.getZ(i);
      // 下巴收尖
      if (y < -0.1) {
        pos.setX(i, x * (1 + y * 0.4));
        pos.setZ(i, z * (1 + y * 0.4));
      }
      // 前额更饱满
      if (z > 0.2 && y > 0.1) {
        pos.setZ(i, z * 1.02);
      }
    }
    pos.needsUpdate = true;
    headGeom.computeVertexNormals();

    const head = new THREE.Mesh(headGeom, skinMat);
    head.castShadow = true;
    head.receiveShadow = true;
    this.headGroup.add(head);
    this.head = head;

    // 脖子
    const neck = new THREE.Mesh(
      new THREE.CylinderGeometry(0.22, 0.28, 0.55, 32),
      skinMat
    );
    neck.position.y = -0.6;
    neck.castShadow = true;
    this.headGroup.add(neck);

    // 肩部
    const shoulder = new THREE.Mesh(
      new THREE.SphereGeometry(0.95, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2.4),
      new THREE.MeshStandardMaterial({ color: '#E2D4F3', roughness: .9 })
    );
    shoulder.position.y = -1.05;
    shoulder.scale.set(1.3, 0.5, 0.8);
    shoulder.receiveShadow = true;
    this.headGroup.add(shoulder);

    // 眼睛
    const eyeMat = new THREE.MeshStandardMaterial({ color: '#2a1f2d', roughness: 0.2 });
    const eyeGeom = new THREE.SphereGeometry(0.035, 16, 16);
    const eyeL = new THREE.Mesh(eyeGeom, eyeMat);
    const eyeR = new THREE.Mesh(eyeGeom, eyeMat);
    eyeL.position.set(-0.17, 0.03, 0.48);
    eyeR.position.set(0.17, 0.03, 0.48);
    this.headGroup.add(eyeL, eyeR);

    // 嘴
    const mouth = new THREE.Mesh(
      new THREE.TorusGeometry(0.06, 0.012, 8, 20, Math.PI),
      new THREE.MeshStandardMaterial({ color: '#C06F7E', roughness: 0.4 })
    );
    mouth.rotation.z = Math.PI;
    mouth.position.set(0, -0.2, 0.48);
    this.headGroup.add(mouth);

    // 腮红
    const blushMat = new THREE.MeshBasicMaterial({ color: '#F4B9C6', transparent: true, opacity: 0.5 });
    const blushL = new THREE.Mesh(new THREE.CircleGeometry(0.07, 24), blushMat);
    const blushR = new THREE.Mesh(new THREE.CircleGeometry(0.07, 24), blushMat);
    blushL.position.set(-0.22, -0.1, 0.5);
    blushR.position.set(0.22, -0.1, 0.5);
    this.headGroup.add(blushL, blushR);

    // 耳朵
    const earMat = skinMat.clone();
    const earGeom = new THREE.SphereGeometry(0.08, 16, 16);
    const earL = new THREE.Mesh(earGeom, earMat);
    const earR = new THREE.Mesh(earGeom, earMat);
    earL.scale.set(0.6, 1.2, 0.4);
    earR.scale.set(0.6, 1.2, 0.4);
    earL.position.set(-0.48, -0.02, 0.05);
    earR.position.set(0.48, -0.02, 0.05);
    this.headGroup.add(earL, earR);
  }

  /* ----------- 发丝构建 ----------- */
  setHair({ hairColor, style, length, density, rainbow } = {}) {
    if (hairColor !== undefined) this.options.hairColor = hairColor;
    if (style !== undefined) this.options.style = style;
    if (length !== undefined) this.options.length = length;
    if (density !== undefined) this.options.density = density;
    if (rainbow !== undefined) this.options.rainbow = rainbow;

    // 清空老发丝
    if (this.hairGroup) {
      this.scene.remove(this.hairGroup);
      this.hairGroup.traverse((o) => {
        if (o.geometry) o.geometry.dispose();
        if (o.material) o.material.dispose();
      });
    }
    this.hairGroup = new THREE.Group();
    this.scene.add(this.hairGroup);

    const len = this.options.length / 60; // 归一化到 3D 尺度
    const col = new THREE.Color(this.options.hairColor || '#3b2418');

    const hairMat = new THREE.MeshStandardMaterial({
      color: col,
      roughness: 0.45,
      metalness: 0.05,
    });

    // 顶盖（头发的"帽子"）
    const capGeom = new THREE.SphereGeometry(0.58, 48, 32, 0, Math.PI * 2, 0, Math.PI * 0.55);
    const cap = new THREE.Mesh(capGeom, hairMat);
    cap.castShadow = true;
    this.hairGroup.add(cap);

    // 根据 style 添加发束
    const strands = this._buildStrands(this.options.style, len, this.options.density || 1, hairMat);
    strands.forEach((s) => this.hairGroup.add(s));

    // 彩虹：用多色材质环绕
    if (this.options.rainbow) {
      const rainbowColors = ['#ff6ea2','#b79cd9','#3a8cb8','#3c6b47','#e07a3c'];
      strands.forEach((s, i) => {
        s.material = new THREE.MeshStandardMaterial({
          color: new THREE.Color(rainbowColors[i % rainbowColors.length]),
          roughness: 0.45,
        });
      });
    }
  }

  _buildStrands(style, len, density, baseMat) {
    const strands = [];
    const baseCount = Math.round(30 * density);

    // 默认参数
    const radius = 0.56;
    const topY = 0.15;

    function strand(fromAngle, toAngle, lengthScale = 1, curve = 0, flare = 0, forwardOffset = 0) {
      const count = Math.max(8, Math.round((toAngle - fromAngle) / (Math.PI * 2) * baseCount));
      const g = new THREE.Group();
      for (let i = 0; i < count; i++) {
        const t = i / count;
        const angle = fromAngle + t * (toAngle - fromAngle);
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;

        const curveOff = Math.sin(t * Math.PI) * curve;
        const thickness = 0.03 + Math.random() * 0.012;

        // 用贝塞尔曲线生成发丝
        const pts = [];
        const L = len * lengthScale * (0.9 + Math.random() * 0.25);
        const segments = 8;
        for (let s = 0; s <= segments; s++) {
          const u = s / segments;
          const y = topY - u * L;
          const bend = Math.sin(u * Math.PI) * curveOff + (flare * u * u);
          const xs = x * (1 + u * 0.05) + bend * 0.15;
          const zs = z * (1 + u * 0.05) + forwardOffset * u;
          pts.push(new THREE.Vector3(xs, y, zs));
        }
        const curveObj = new THREE.CatmullRomCurve3(pts);
        const tubeGeom = new THREE.TubeGeometry(curveObj, 12, thickness, 6, false);
        const mesh = new THREE.Mesh(tubeGeom, baseMat);
        mesh.castShadow = true;
        g.add(mesh);
      }
      return g;
    }

    // 根据 style 生成不同的发型
    switch (style) {
      case 'pixie-cut': {
        strands.push(strand(0, Math.PI * 2, 0.25, 0.2, 0.05));
        break;
      }
      case 'bob': {
        strands.push(strand(0, Math.PI * 2, 0.55, 0.1));
        break;
      }
      case 'lob': {
        strands.push(strand(0, Math.PI * 2, 0.75, 0.15));
        break;
      }
      case 'wavy': {
        strands.push(strand(0, Math.PI * 2, 1.0, 0.25, 0.1));
        break;
      }
      case 'curly': {
        // 多层叠加模拟卷发
        strands.push(strand(0, Math.PI * 2, 0.95, 0.4, 0.2));
        strands.push(strand(0, Math.PI * 2, 0.85, -0.3, 0.15));
        break;
      }
      case 'twintails': {
        // 侧面两束大束 + 顶部帽子
        strands.push(strand(0, Math.PI * 2, 0.45, 0.1));
        // 左束
        const leftBundle = new THREE.Group();
        for (let i = 0; i < 40; i++) {
          const t = i / 40;
          const offX = -0.45 - Math.random() * 0.05;
          const offZ = (Math.random() - 0.5) * 0.2;
          const pts = [];
          for (let s = 0; s <= 8; s++) {
            const u = s / 8;
            pts.push(new THREE.Vector3(
              offX - u * 0.15,
              0.05 - u * len * 1.1,
              offZ + Math.sin(u * 3) * 0.04,
            ));
          }
          const curveObj = new THREE.CatmullRomCurve3(pts);
          const g = new THREE.TubeGeometry(curveObj, 12, 0.025, 6, false);
          leftBundle.add(new THREE.Mesh(g, baseMat));
        }
        const rightBundle = leftBundle.clone(true);
        rightBundle.scale.x = -1;
        strands.push(leftBundle, rightBundle);
        break;
      }
      case 'ponytail': {
        strands.push(strand(0, Math.PI * 2, 0.4, 0.1));
        // 背后马尾
        const tail = new THREE.Group();
        for (let i = 0; i < 60; i++) {
          const offX = (Math.random() - 0.5) * 0.15;
          const pts = [];
          const L = len * 1.3 * (0.9 + Math.random() * 0.2);
          for (let s = 0; s <= 10; s++) {
            const u = s / 10;
            pts.push(new THREE.Vector3(
              offX * (1 - u),
              0.15 - u * L,
              -0.4 - u * 0.2 + Math.sin(u * 4) * 0.03,
            ));
          }
          const curveObj = new THREE.CatmullRomCurve3(pts);
          const g = new THREE.TubeGeometry(curveObj, 14, 0.024, 6, false);
          tail.add(new THREE.Mesh(g, baseMat));
        }
        strands.push(tail);
        break;
      }
      case 'layered': {
        strands.push(strand(0, Math.PI * 2, 0.8, 0.2, 0.15));
        strands.push(strand(0, Math.PI * 2, 0.55, 0.1, 0.1));
        break;
      }
      case 'straight':
      default: {
        strands.push(strand(0, Math.PI * 2, 1.0, 0.08, 0.05));
        break;
      }
    }

    // 通用刘海
    const bang = strand(Math.PI * 0.25, Math.PI * 0.75, 0.2, 0.05, 0.02, 0.05);
    bang.position.y = 0.05;
    strands.push(bang);

    return strands;
  }

  /* ----------- 控制接口 ----------- */
  setColor(hex, rainbow = false) {
    this.setHair({ hairColor: hex, rainbow });
  }
  setStyle(style) {
    this.setHair({ style });
  }
  setLength(cm) {
    this.setHair({ length: cm });
  }
  setAutoRotate(v) {
    this.controls.autoRotate = !!v;
  }
  resetView() {
    this.camera.position.set(0, 0.2, 2.8);
    this.controls.target.set(0, 0.1, 0);
    this.controls.update();
  }

  /* ----------- 动画与尺寸 ----------- */
  _animate = () => {
    this._raf = requestAnimationFrame(this._animate);
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  };

  _handleResize() {
    this._ro = new ResizeObserver(() => this._resize());
    this._ro.observe(this.container);
  }
  _resize() {
    const { clientWidth: w, clientHeight: h } = this.container;
    if (!w || !h) return;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  dispose() {
    cancelAnimationFrame(this._raf);
    this._ro?.disconnect();
    this.renderer.dispose();
    this.container.innerHTML = '';
  }
}
