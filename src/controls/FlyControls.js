import {
Controls,
MOUSE,
Quaternion,
Spherical,
TOUCH,
Vector2,
Vector3,
Plane,
Ray,
MathUtils
} from 'three';

/**
 * Fires when the camera has been transformed by the controls.
 *
 * @event FlyControls#change
 * @type {Object}
 */
const _changeEvent = { type: 'change' };

/**
 * Fires when an interaction was initiated.
 *
 * @event FlyControls#start
 * @type {Object}
 */
const _startEvent = { type: 'start' };

/**
 * Fires when an interaction has finished.
 *
 * @event FlyControls#end
 * @type {Object}
 */
const _endEvent = { type: 'end' };

const _ray = new Ray();
const _plane = new Plane();
const _TILT_LIMIT = Math.cos( 70 * MathUtils.DEG2RAD );

const _v = new Vector3();
const _twoPI = 2 * Math.PI;

const _STATE = {
NONE: - 1,
ROTATE: 0,
DOLLY: 1,
PAN: 2,
TOUCH_ROTATE: 3,
TOUCH_PAN: 4,
TOUCH_DOLLY_PAN: 5,
TOUCH_DOLLY_ROTATE: 6
};
const _EPS = 0.000001;

/**
 * FlyControls - 三维飞行控制器
 * 
 * 本文件实现了基于Three.js的飞行控制器，支持通过键盘WASD/QE和方向键进行三维空间自由移动和旋转，
 * 鼠标左键拖动时，镜头视点位置围绕目标点（target）做弧形运动（保持y轴不变），实现类似环绕观察的效果。
 * 主要功能：
 * - 键盘飞行（WASD/QE/方向键，Q/E为左右旋转镜头，绕Y轴旋转）
 * - 鼠标左键：镜头绕target点水平旋转（y轴不变，极坐标变换）
 * - 鼠标中键：缩放
 * - 鼠标右键：平移
 * - 支持自定义旋转、缩放、平移速度
 * - 支持target同步
 * 
 * 可配置参数（仅保留有效参数）：
 * @param {number} targetDistance  相机与target的默认距离，默认10
 * @param {number} movementSpeed   键盘移动速度，默认1.0
 * @param {number} rollSpeed       键盘旋转速度，默认0.005
 * @param {boolean} dragToLook     是否仅在拖拽时允许视角旋转，默认false
 * @param {boolean} autoForward    是否自动向前移动，默认false
 * @param {number} minDistance     透视相机最小推进距离，默认0
 * @param {number} maxDistance     透视相机最大推进距离，默认Infinity
 * @param {number} minZoom         正交相机最小缩放，默认0
 * @param {number} maxZoom         正交相机最大缩放，默认Infinity
 * @param {boolean} enableZoom     是否允许鼠标缩放，默认true
 * @param {number} zoomSpeed       鼠标缩放速度，默认1.0
 * @param {boolean} enableRotate   是否允许鼠标旋转，默认true
 * @param {number} rotateSpeed     鼠标旋转速度，默认0.5
 * @param {boolean} enablePan      是否允许鼠标平移，默认true
 * @param {number} panSpeed        鼠标平移速度，默认1.0
 * @param {boolean} enableKeyboard 是否允许键盘操作，默认true
 * @param {Object} keys            键盘映射
 * @param {Object} mouseButtons    鼠标按钮映射
 * @param {Object} touches         触摸事件映射
 * @param {boolean} lockY          是否锁定Y轴（鼠标左键旋转时），默认true
 * 
 * @augments Controls
 * @three_import import { FlyControls } from 'three/addons/controls/FlyControls.js';
 */
class FlyControls extends Controls {

    /**
     * 构造新的飞行控制器实例。
     * 该控制器支持通过键盘WASD/QE和方向键进行三维空间自由移动和旋转。
     * 新增属性：movementSpeed、rollSpeed、dragToLook、autoForward，支持飞行模式常用操作。
     * 新增内部变量：_moveState、_moveVector、_rotationVector、_lastQuaternion、_lastPosition、_status，用于记录移动/旋转状态。
     * @param {Object3D} object - 被控制的对象。
     * @param {?HTMLDOMElement} domElement - 用于事件监听的HTML元素。
     * @param {number} targetDistance - 相机与target的默认距离（右键平移/滚轮/W/S操作时保持该距离），默认10
     */
    constructor( object, domElement = null, targetDistance = 10 ) {
        super( object, domElement );

        this.state = _STATE.NONE;

        /**
         * 镜头是否锁定Y轴（鼠标左键旋转时）
         * @type {boolean}
         * @default true
         */
        this.lockY = false;

        /**
         * 相机与target的默认距离（右键平移/滚轮/W/S操作时保持该距离）
         * @type {number}
         * @default 10
         */
        this.targetDistance = targetDistance;

        /**
         * 键盘移动速度
         * @type {number}
         * @default 10
         */
        this.movementSpeed = 10.0;

        /**
         * 键盘旋转速度
         * @type {number}
         * @default 0.05
         */
        this.rollSpeed = 0.05;

        /**
         * 是否允许键盘操作
         * @type {boolean}
         * @default true
         */
        this.enableKeyboard = true;

        /**
         * 是否仅在拖拽时允许视角旋转
         * @type {boolean}
         * @default false
         */
        this.dragToLook = false;

        /**
         * 是否自动向前移动
         * @type {boolean}
         * @default false
         */
        this.autoForward = false;

        // 飞行控制内部状态
        /**
         * 记录各方向移动/旋转的状态
         * @type {Object}
         */
        this._moveState = { up: 0, down: 0, left: 0, right: 0, forward: 0, back: 0, pitchUp: 0, pitchDown: 0, yawLeft: 0, yawRight: 0, rollLeft: 0, rollRight: 0 };
        /**
         * 当前移动向量
         * @type {Vector3}
         */
        this._moveVector = new Vector3( 0, 0, 0 );
        /**
         * 当前旋转向量
         * @type {Vector3}
         */
        this._rotationVector = new Vector3( 0, 0, 0 );
        /**
         * 上一次四元数
         * @type {Quaternion}
         */
        this._lastQuaternion = new Quaternion();
        /**
         * 上一次位置
         * @type {Vector3}
         */
        this._lastPosition = new Vector3();
        /**
         * 拖拽状态计数
         * @type {number}
         */
        this._status = 0;

        /**
         * The focus point of the controls, the `object` orbits around this.
         * It can be updated manually at any point to change the focus of the controls.
         *
         * @type {Vector3}
         */
        this.target = new Vector3();

        /**
         * The focus point of the `minTargetRadius` and `maxTargetRadius` limits.
         * It can be updated manually at any point to change the center of interest
         * for the `target`.
         *
         * @type {Vector3}
         */
        this.cursor = new Vector3();

        /**
         * How far you can dolly in (perspective camera only).
         *
         * @type {number}
         * @default 0
         */
        this.minDistance = 0;

        /**
         * How far you can dolly out (perspective camera only).
         *
         * @type {number}
         * @default Infinity
         */
        this.maxDistance = Infinity;

        /**
         * How far you can zoom in (orthographic camera only).
         *
         * @type {number}
         * @default 0
         */
        this.minZoom = 0;

        /**
         * How far you can zoom out (orthographic camera only).
         *
         * @type {number}
         * @default Infinity
         */
        this.maxZoom = Infinity;

        
        
        
        
        /**
         * Enable or disable zooming (dollying) of the camera.
         *
         * @type {boolean}
         * @default true
         */
        this.enableZoom = true;

        /**
         * Speed of zooming / dollying.
         *
         * @type {number}
         * @default 1
         */
        this.zoomSpeed = 1.0;

        /**
         * Enable or disable horizontal and vertical rotation of the camera.
         *
         * Note that it is possible to disable a single axis by setting the min and max of the
         * `minPolarAngle` or `minAzimuthAngle` to the same value, which will cause the vertical
         * or horizontal rotation to be fixed at that value.
         *
         * @type {boolean}
         * @default true
         */
        this.enableRotate = true;

        /**
         * Speed of rotation.
         *
         * @type {number}
         * @default 0.5
         */
        this.rotateSpeed = 0.5;

        
        /**
         * Enable or disable camera panning.
         *
         * @type {boolean}
         * @default true
         */
        this.enablePan = true;

        /**
         * Speed of panning.
         *
         * @type {number}
         * @default 1
         */
        this.panSpeed = 1.0;

        
        
        
        
        /**
         * This object contains references to the keycodes for controlling camera panning.
         *
         * ```js
         * controls.keys = {
         * LEFT: 'ArrowLeft', //left arrow
         * UP: 'ArrowUp', // up arrow
         * RIGHT: 'ArrowRight', // right arrow
         * BOTTOM: 'ArrowDown' // down arrow
         * }
         * ```
         * @type {Object}
         */
        this.keys = { LEFT: 'ArrowLeft', UP: 'ArrowUp', RIGHT: 'ArrowRight', BOTTOM: 'ArrowDown' };

        /**
         * This object contains references to the mouse actions used by the controls.
         *
         * ```js
         * controls.mouseButtons = {
         * LEFT: THREE.MOUSE.ROTATE,
         * MIDDLE: THREE.MOUSE.DOLLY,
         * RIGHT: THREE.MOUSE.PAN
         * }
         * ```
         * @type {Object}
         */
        this.mouseButtons = { LEFT: MOUSE.ROTATE, MIDDLE: MOUSE.DOLLY, RIGHT: MOUSE.PAN };

        /**
         * This object contains references to the touch actions used by the controls.
         *
         * ```js
         * controls.mouseButtons = {
         * ONE: THREE.TOUCH.ROTATE,
         * TWO: THREE.TOUCH.DOLLY_PAN
         * }
         * ```
         * @type {Object}
         */
        this.touches = { ONE: TOUCH.ROTATE, TWO: TOUCH.DOLLY_PAN };

        /**
         * Used internally by `saveState()` and `reset()`.
         *
         * @type {Vector3}
         */
        this.target0 = this.target.clone();

        /**
         * Used internally by `saveState()` and `reset()`.
         *
         * @type {Vector3}
         */
        this.position0 = this.object.position.clone();

        
        // internals

        this._lastPosition = new Vector3();
        this._lastQuaternion = new Quaternion();
        this._lastTargetPosition = new Vector3();

        // so camera.up is the orbit axis
        this._quat = new Quaternion().setFromUnitVectors( object.up, new Vector3( 0, 1, 0 ) );
        this._quatInverse = this._quat.clone().invert();

        // current position in spherical coordinates
        this._spherical = new Spherical();
        this._sphericalDelta = new Spherical();

        this._scale = 1;
        this._panOffset = new Vector3();

        this._rotateStart = new Vector2();
        this._rotateEnd = new Vector2();
        this._rotateDelta = new Vector2();

        this._panStart = new Vector2();
        this._panEnd = new Vector2();
        this._panDelta = new Vector2();

        this._dollyStart = new Vector2();
        this._dollyEnd = new Vector2();
        this._dollyDelta = new Vector2();

        this._dollyDirection = new Vector3();
        this._mouse = new Vector2();
        this._performCursorZoom = false;

        this._pointers = [];
        this._pointerPositions = {};

        this._controlActive = false;

        // 事件监听器
        this._onKeyDown = this.onKeyDown.bind( this );
        this._onKeyUp = this.onKeyUp.bind( this );

        // 修正：定义为类方法
        this._onPointerMove = this.onPointerMove.bind(this);
        this._onPointerDown = this.onPointerDown.bind(this);
        this._onPointerUp = this.onPointerUp.bind(this);
        this._onPointerCancel = this.onPointerCancel.bind(this);
        this._onContextMenu = this.onContextMenu.bind(this);

this._onMouseWheel = this.onMouseWheel.bind( this );

this._onTouchStart = this.onTouchStart.bind( this );
this._onTouchMove = this.onTouchMove.bind( this );

this._onMouseDown = this.onMouseDown.bind( this );
this._onMouseMove = this.onMouseMove.bind( this );

this._interceptControlDown = this.interceptControlDown.bind( this );
this._interceptControlUp = this.interceptControlUp.bind( this );

        //

        if ( this.domElement !== null ) {
            this.connect( this.domElement );
        }
        this.update();
    }

    /**
     * 注册事件监听，确保键盘和鼠标事件能被正确响应。
     * @param {HTMLElement} element
     */
    connect(element) {
        // 先调用父类 connect
        if (super.connect) super.connect(element);

        window.addEventListener('keydown', this._onKeyDown);
        window.addEventListener('keyup', this._onKeyUp);

        this.domElement.addEventListener('pointermove', this._onPointerMove);
        this.domElement.addEventListener('pointerdown', this._onPointerDown);
        this.domElement.addEventListener('pointerup', this._onPointerUp);
        this.domElement.addEventListener('pointercancel', this._onPointerCancel);
        this.domElement.addEventListener('contextmenu', this._onContextMenu);
        this.domElement.addEventListener('wheel', this._onMouseWheel, { passive: false });
    }

    /**
     * 注销事件监听，释放资源。
     */
    disconnect() {
        window.removeEventListener('keydown', this._onKeyDown);
        window.removeEventListener('keyup', this._onKeyUp);

        if (this.domElement) {
            this.domElement.removeEventListener('pointermove', this._onPointerMove);
            this.domElement.removeEventListener('pointerdown', this._onPointerDown);
            this.domElement.removeEventListener('pointerup', this._onPointerUp);
            this.domElement.removeEventListener('pointercancel', this._onPointerCancel);
            this.domElement.removeEventListener('contextmenu', this._onContextMenu);
            this.domElement.removeEventListener('wheel', this._onMouseWheel);
        }
    }

    /**
     * 销毁控制器，自动断开事件监听。
     */
    dispose() {
        this.disconnect();
    }

    /**
     * 更新移动向量
     * @private
     */
    _updateMovementVector() {
        const forward = ( this._moveState.forward || ( this.autoForward && !this._moveState.back ) ) ? 1 : 0;
        this._moveVector.x = ( -this._moveState.left + this._moveState.right );
        this._moveVector.y = ( -this._moveState.down + this._moveState.up );
        this._moveVector.z = ( -forward + this._moveState.back );
    }

    /**
     * 更新旋转向量
     * @private
     */
    _updateRotationVector() {
        this._rotationVector.x = ( -this._moveState.pitchDown + this._moveState.pitchUp );
        this._rotationVector.y = ( -this._moveState.yawRight + this._moveState.yawLeft );
        this._rotationVector.z = ( -this._moveState.rollRight + this._moveState.rollLeft );
    }

    /**
     * 键盘按下事件处理
     * @param {KeyboardEvent} event
     * @private
     */
    onKeyDown( event ) {
        if ( event.altKey || this.enabled === false || this.enableKeyboard === false ) return;
        switch ( event.code ) {
            case 'ShiftLeft':
            case 'ShiftRight': this.movementSpeedMultiplier = .1; break;
            case 'KeyW': this._moveState.forward = 1; break;
            case 'KeyS': this._moveState.back = 1; break;
            case 'KeyA': this._moveState.left = 1; break;
            case 'KeyD': this._moveState.right = 1; break;
            case 'KeyR': this._moveState.up = 1; break;
            case 'Space': this._moveState.up = 1; break; // 空格键逻辑，行为与R键一致
            case 'KeyF': this._moveState.down = 1; break;
            case 'ArrowUp': this._moveState.pitchUp = 1; break;
            case 'ArrowDown': this._moveState.pitchDown = 1; break;
            case 'ArrowLeft': this._moveState.yawLeft = 1; break;
            case 'ArrowRight': this._moveState.yawRight = 1; break;
            case 'KeyQ': this._moveState.yawLeft = 1; break; // Q键：绕Y轴左旋（左转镜头）
            case 'KeyE': this._moveState.yawRight = 1; break; // E键：绕Y轴右旋（右转镜头）
            // Q/E 控制已移除
        }
        this._updateMovementVector();
        this._updateRotationVector();
    }

    /**
     * 键盘松开事件处理
     * @param {KeyboardEvent} event
     * @private
     */
    onKeyUp( event ) {
        if ( this.enabled === false || this.enableKeyboard === false ) return;
        switch ( event.code ) {
            case 'ShiftLeft':
            case 'ShiftRight': this.movementSpeedMultiplier = 1; break;
            case 'KeyW': this._moveState.forward = 0; break;
            case 'KeyS': this._moveState.back = 0; break;
            case 'KeyA': this._moveState.left = 0; break;
            case 'KeyD': this._moveState.right = 0; break;
            case 'KeyR': this._moveState.up = 0; break;
            case 'Space': this._moveState.up = 0; break; // 空格键逻辑，行为与R键一致
            case 'KeyF': this._moveState.down = 0; break;
            case 'ArrowUp': this._moveState.pitchUp = 0; break;
            case 'ArrowDown': this._moveState.pitchDown = 0; break;
            case 'ArrowLeft': this._moveState.yawLeft = 0; break;
            case 'ArrowRight': this._moveState.yawRight = 0; break;
            case 'KeyQ': this._moveState.yawLeft = 0; break; // Q键：绕Y轴左旋（左转镜头）
            case 'KeyE': this._moveState.yawRight = 0; break; // E键：绕Y轴右旋（右转镜头）
            // Q/E 控制已移除
        }
        this._updateMovementVector();
        this._updateRotationVector();
    }

    // 修正：补充缺失的指针事件处理方法，防止初始化报错
    // OrbitControls风格鼠标事件处理
    /**
     * 鼠标移动事件处理，分发旋转/缩放/平移。
     * @param {PointerEvent} event
     * @private
     */
    /**
     * 鼠标移动事件处理，分发旋转/缩放/平移。
     * 鼠标左键拖动时，镜头视点位置围绕目标点做弧形运动（y轴不变）。
     * @param {PointerEvent} event
     * @private
     */
    onPointerMove(event) {
        if (this.enabled === false) return;
        switch (this.state) {
            case _STATE.ROTATE: {
                // 计算鼠标移动增量
                this._rotateEnd.set(event.clientX, event.clientY);
                this._rotateDelta.subVectors(this._rotateEnd, this._rotateStart).multiplyScalar(this.rotateSpeed);

                // 计算相机到target的向量
                const offset = new Vector3().subVectors(this.object.position, this.target);

                // 转为极坐标
                const spherical = new Spherical();
                spherical.setFromVector3(offset);

                if (this.lockY) {
                    // 水平环绕（phi为方位角，theta为极角，保持theta不变，调整phi）
                    spherical.theta -= 2 * Math.PI * this._rotateDelta.x / this.domElement.clientWidth;
                } else {
                    // 自由环绕（调整phi和theta）
                    spherical.theta -= 2 * Math.PI * this._rotateDelta.x / this.domElement.clientWidth;
                    spherical.phi -= 2 * Math.PI * this._rotateDelta.y / this.domElement.clientHeight;
                }

                let newOffset = new Vector3().setFromSpherical(spherical);

                if(this.lockY) {
                    // 强制平视
                    newOffset.y = 0;
                }

                this.object.position.copy(this.target).add(newOffset);

                // 始终朝向target
                this.object.lookAt(this.target);

                this._rotateStart.copy(this._rotateEnd);
                this.update();
                break;
            }
            case _STATE.DOLLY:
                this._dollyEnd.set(event.clientX, event.clientY);
                this._dollyDelta.subVectors(this._dollyEnd, this._dollyStart);
                if (this._dollyDelta.y > 0) {
                    this.object.translateZ(this.zoomSpeed);
                } else if (this._dollyDelta.y < 0) {
                    this.object.translateZ(-this.zoomSpeed);
                }
                this._dollyStart.copy(this._dollyEnd);
                this.update();
                // 缩放时target不变
                break;
            case _STATE.PAN:
                this._panEnd.set(event.clientX, event.clientY);
                this._panDelta.subVectors(this._panEnd, this._panStart).multiplyScalar(this.panSpeed);
                // 仅简单实现：沿相机右/上方向平移，提升移动幅度
                const offsetX = -this._panDelta.x * 0.01;
                const offsetY = this._panDelta.y * 0.01;
                this.object.position.addScaledVector(new Vector3().setFromMatrixColumn(this.object.matrix, 0), offsetX);
                this.object.position.addScaledVector(new Vector3().setFromMatrixColumn(this.object.matrix, 1), offsetY);
                this._panStart.copy(this._panEnd);
                this.update();
                // 新增：平移时同步target
                this._syncTargetAfterTransform();
                break;
        }
    }

    /**
     * 鼠标按下事件处理，决定操作类型。
     * @param {PointerEvent} event
     * @private
     */
    onPointerDown(event) {
        if (this.enabled === false) return;
        switch (event.button) {
            case 0: // 左键旋转
                this.state = _STATE.ROTATE;
                this._rotateStart.set(event.clientX, event.clientY);
                break;
            case 1: // 中键缩放
                this.state = _STATE.DOLLY;
                this._dollyStart.set(event.clientX, event.clientY);
                break;
            case 2: // 右键平移
                this.state = _STATE.PAN;
                this._panStart.set(event.clientX, event.clientY);
                break;
        }
        this.dispatchEvent(_startEvent);
    }

    /**
     * 鼠标松开事件处理，重置状态。
     * @param {PointerEvent} event
     * @private
     */
    onPointerUp(event) {
        if (this.enabled === false) return;
        this.state = _STATE.NONE;
        this.dispatchEvent(_endEvent);
    }

    /**
     * 鼠标取消事件处理，重置状态。
     * @private
     */
    onPointerCancel() {
        if (this.enabled === false) return;
        this.state = _STATE.NONE;
    }

    /**
     * 右键菜单事件处理，阻止默认菜单弹出。
     * @param {PointerEvent} event
     * @private
     */
    onContextMenu(event) {
        if (this.enabled === false) return;
        event.preventDefault();
    }

    /**
     * 鼠标滚轮事件处理，用于缩放或推进相机。
     * @param {WheelEvent} event
     * @private
     */
onMouseWheel(event) {
    if (this.enabled === false || this.enableZoom === false) return;
    event.preventDefault();
    // 兼容不同浏览器的滚轮方向
    let delta = (event.deltaY < 0) ? -1 : 1;
    // 透视相机推进，正交相机缩放
    if (this.object.isPerspectiveCamera) {
        // 计算相机前方方向
        const dir = new Vector3();
        this.object.getWorldDirection(dir);
        // 推进相机
        this.object.translateZ(delta * this.zoomSpeed);
        // target同步移动，保持距离为targetDistance
        this.target.copy(this.object.position).add(dir.multiplyScalar(this.targetDistance));
    } else if (this.object.isOrthographicCamera) {
        this.object.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.object.zoom - delta * 0.05 * this.zoomSpeed));
        this.object.updateProjectionMatrix();
    }
    this.dispatchEvent(_changeEvent);
}

    /**
     * 触摸开始事件处理（占位，防止初始化报错）。
     * @param {TouchEvent} event
     * @private
     */
    onTouchStart(event) {}

    /**
     * 触摸移动事件处理（占位，防止初始化报错）。
     * @param {TouchEvent} event
     * @private
     */
    onTouchMove(event) {}

    /**
     * 鼠标按下事件处理（占位，防止初始化报错）。
     * @param {MouseEvent} event
     * @private
     */
    onMouseDown(event) {}

    /**
     * 鼠标移动事件处理（占位，防止初始化报错）。
     * @param {MouseEvent} event
     * @private
     */
    onMouseMove(event) {}

    /**
     * 控制器按下拦截事件处理（占位，防止初始化报错）。
     * @param {Event} event
     * @private
     */
    interceptControlDown(event) {}

    /**
     * 控制器松开拦截事件处理（占位，防止初始化报错）。
     * @param {Event} event
     * @private
     */
    interceptControlUp(event) {}

    /**
     * 更新飞行控制器状态，支持基于键盘的三维移动与旋转。
     * @param {number} delta - 每帧的时间间隔（秒）
     */
    update( delta = 0.016 ) {

        if ( this.enabled === false ) return;

        const object = this.object;
        const moveMult = delta * this.movementSpeed;
        const rotMult = delta * this.rollSpeed;

object.translateX( this._moveVector.x * moveMult );
object.translateY( this._moveVector.y * moveMult );
object.translateZ( this._moveVector.z * moveMult );
// W/S前后移动时，target同步移动，保持距离为targetDistance
if (this._moveVector.z !== 0) {
    const dir = new Vector3();
    object.getWorldDirection(dir);
    this.target.copy(object.position).add(dir.multiplyScalar(this.targetDistance));
}

        // Q/E键：绕相机Y轴旋转target（视点），镜头始终朝向target
        if (this._moveState.yawLeft || this._moveState.yawRight) {
            const offset = new Vector3().subVectors(this.target, object.position);
            const radius = offset.length();
            let theta = Math.atan2(offset.z, offset.x);
            const angleDelta = (this._moveState.yawRight - this._moveState.yawLeft) * rotMult * 10;
            theta += angleDelta;
            const newOffset = new Vector3(
                Math.cos(theta) * radius,
                offset.y,
                Math.sin(theta) * radius
            );
            this.target.copy(object.position).add(newOffset);
            object.lookAt(this.target);
        }

        // A/D键：target沿相机右向左右平移，镜头始终朝向target
        if (this._moveState.left || this._moveState.right) {
            const right = new Vector3();
            object.getWorldDirection(right);
            right.cross(object.up).normalize(); // 相机右向
            const delta = (this._moveState.right - this._moveState.left) * moveMult;
            this.target.addScaledVector(right, delta);
            object.lookAt(this.target);
        }

        // 保证镜头和target的Y值同步（空格/R/F）
        if (this._moveVector.y !== 0) {
            this.target.y += this._moveVector.y * moveMult;
        }

        const _tmpQuaternion = new Quaternion();
        _tmpQuaternion.set(
            this._rotationVector.x * rotMult,
            this._rotationVector.y * rotMult,
            this._rotationVector.z * rotMult,
            1
        ).normalize();
        object.quaternion.multiply( _tmpQuaternion );

        if (
            this._lastPosition.distanceToSquared( object.position ) > _EPS ||
            8 * ( 1 - this._lastQuaternion.dot( object.quaternion ) ) > _EPS
        ) {
            this.dispatchEvent( _changeEvent );
            this._lastQuaternion.copy( object.quaternion );
            this._lastPosition.copy( object.position );
        }

    }

    /**
     * 拖拽变换后同步target为相机前方一定距离
     * 旋转/平移后target为相机前方targetDistance单位点
     */
    _syncTargetAfterTransform() {
        // 取相机前方targetDistance单位点
        const dir = new Vector3();
        this.object.getWorldDirection(dir);
        this.target.copy(this.object.position).add(dir.multiplyScalar(this.targetDistance));
    }

    // ... 其余原有方法保持不变

}

export { FlyControls };
