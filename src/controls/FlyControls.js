/**
 * FlyControls.js
 * 实现三维场景中自由飞行相机控制，支持键盘与鼠标操作。
 * 鼠标操作：按下鼠标后拖动，计算偏移量控制视角旋转。
 * 适用于three.js场景编辑器等应用。
 */

import {
EventDispatcher,
Quaternion,
Vector3
} from 'three';

const _changeEvent = { type: 'change' };

class FlyControls extends EventDispatcher {

	constructor( object, domElement ) {

		super();

		this.object = object;
		this.domElement = domElement;

		// API

		// Set to false to disable this control
		this.enabled = true;

		this.movementSpeed = 1.0;
		this.rollSpeed = 0.005;

		this.dragToLook = false;
		this.autoForward = false;

		// disable default target object behavior

		// internals

		const scope = this;

		const EPS = 0.000001;

		const lastQuaternion = new Quaternion();
		const lastPosition = new Vector3();

		this.tmpQuaternion = new Quaternion();

		this.status = 0;

/**
 * 控制状态
 * rollLeft/rollRight不再用于Q/E，Q/E用于目标点绕相机旋转
 */
this.moveState = { up: 0, down: 0, left: 0, right: 0, forward: 0, back: 0, pitchUp: 0, pitchDown: 0, yawLeft: 0, yawRight: 0, rollLeft: 0, rollRight: 0 };
/**
 * Q/E自定义目标点旋转状态
 */
this._rotateTargetLeft = false;
this._rotateTargetRight = false;
		this.moveVector = new Vector3( 0, 0, 0 );
		this.rotationVector = new Vector3( 0, 0, 0 );

		this.keydown = function ( event ) {

			if ( event.altKey || this.enabled === false ) {

				return;

			}

switch ( event.code ) {

case 'ShiftLeft':
case 'ShiftRight': this.movementSpeedMultiplier = .1; break;

case 'KeyW': this.moveState.forward = 1; break;
case 'KeyS': this.moveState.back = 1; break;

case 'KeyA': this.moveState.left = 1; break;
case 'KeyD': this.moveState.right = 1; break;

case 'KeyR': this.moveState.up = 1; break;
case 'KeyF': this.moveState.down = 1; break;

case 'ArrowUp': this.moveState.pitchUp = 1; break;
case 'ArrowDown': this.moveState.pitchDown = 1; break;

case 'ArrowLeft': this.moveState.yawLeft = 1; break;
case 'ArrowRight': this.moveState.yawRight = 1; break;

// Q/E用于目标点绕相机旋转
case 'KeyQ': this._rotateTargetLeft = true; break;
case 'KeyE': this._rotateTargetRight = true; break;

}

			this.updateMovementVector();
			this.updateRotationVector();

		};

		this.keyup = function ( event ) {

			if ( this.enabled === false ) return;

switch ( event.code ) {

case 'ShiftLeft':
case 'ShiftRight': this.movementSpeedMultiplier = 1; break;

case 'KeyW': this.moveState.forward = 0; break;
case 'KeyS': this.moveState.back = 0; break;

case 'KeyA': this.moveState.left = 0; break;
case 'KeyD': this.moveState.right = 0; break;

case 'KeyR': this.moveState.up = 0; break;
case 'KeyF': this.moveState.down = 0; break;

case 'ArrowUp': this.moveState.pitchUp = 0; break;
case 'ArrowDown': this.moveState.pitchDown = 0; break;

case 'ArrowLeft': this.moveState.yawLeft = 0; break;
case 'ArrowRight': this.moveState.yawRight = 0; break;

// Q/E松开
case 'KeyQ': this._rotateTargetLeft = false; break;
case 'KeyE': this._rotateTargetRight = false; break;

}

			this.updateMovementVector();
			this.updateRotationVector();

		};

/**
 * 鼠标按下事件处理
 * 记录初始鼠标位置，用于后续计算偏移量控制视角旋转
 */
/**
 * 鼠标拖动状态和目标点
 */
this._mouseDown = false;
this._mouseButton = null; // 0:左键 2:右键
this._startX = 0;
this._startY = 0;
/**
 * 目标点，默认在相机前方10单位
 * 可通过外部设置target属性
 */
this.target = new Vector3();
if (this.object && this.object.position) {
  const dir = new Vector3();
  this.object.getWorldDirection(dir);
  this.target.copy(this.object.position).add(dir.multiplyScalar(10));
}

/**
 * 鼠标按下事件处理
 * 记录初始鼠标位置，用于后续计算偏移量控制视角旋转
 * 仅右键支持旋转，左键不处理旋转
 */
/**
 * 鼠标按下事件处理
 * 左键：准备旋转镜头（绕target y轴）
 * 右键：准备平移镜头
 */
this.pointerdown = function ( event ) {
  if ( this.enabled === false ) return;
  if (event.button === 0 || event.button === 2) {
    this._mouseDown = true;
    this._mouseButton = event.button;
    this._startX = event.clientX;
    this._startY = event.clientY;
  } else {
    this._mouseDown = false;
    this._mouseButton = null;
  }
};

/**
 * 鼠标移动事件处理
 * 仅在鼠标按下状态下，根据偏移量调整视角
 */
/**
 * 鼠标移动事件处理
 * 仅在右键按下状态下，根据偏移量调整视角
 */
/**
 * 鼠标移动事件处理
 * 左键：镜头围绕target y轴旋转
 * 右键：镜头和target一起平移
 */
this.pointermove = function ( event ) {
  if ( this.enabled === false ) return;
  if ( !this._mouseDown ) return;
  const deltaX = event.clientX - this._startX;
  const deltaY = event.clientY - this._startY;
  this._startX = event.clientX;
  this._startY = event.clientY;

  if (this._mouseButton === 0) {
    // 左键：水平绕target y轴旋转，垂直为相机y轴上下移动
    const angle = -deltaX * 0.01; // 水平旋转灵敏度
    const offset = new Vector3().subVectors(this.object.position, this.target);
    const radius = Math.sqrt(offset.x * offset.x + offset.z * offset.z);
    const theta = Math.atan2(offset.z, offset.x);
    // 水平：绕y轴旋转
    const newTheta = theta + angle;
    // 垂直：相机y轴上下移动
    const newY = this.object.position.y + deltaY * 0.05; // 垂直灵敏度
    this.object.position.x = this.target.x + radius * Math.cos(newTheta);
    this.object.position.z = this.target.z + radius * Math.sin(newTheta);
    this.object.position.y = newY;
    // 视线始终看向target
    this.object.lookAt(this.target);
  } else if (this._mouseButton === 2) {
    // 右键：仅平移target，镜头位置不变
    const moveSpeed = 0.02;
    const dir = new Vector3();
    this.object.getWorldDirection(dir);
    const right = new Vector3().crossVectors(dir, this.object.up).normalize();
    const up = this.object.up.clone().normalize();
    // 水平平移
    const moveRight = right.multiplyScalar(-deltaX * moveSpeed);
    // 垂直平移（仅y轴方向）
    const moveUp = up.multiplyScalar(deltaY * moveSpeed);
    this.target.add(moveRight).add(moveUp);
    // 镜头始终看向target
    this.object.lookAt(this.target);
  }
};

/**
 * 鼠标松开事件处理
 * 结束视角旋转，重置偏移量
 */
/**
 * 鼠标松开事件处理
 * 结束视角旋转，重置偏移量
 */
/**
 * 鼠标松开事件处理
 * 结束拖动
 */
this.pointerup = function ( event ) {
  if ( this.enabled === false ) return;
  this._mouseDown = false;
  this._mouseButton = null;
};

		this.pointercancel = function () {

			if ( this.enabled === false ) return;

			if ( this.dragToLook ) {

				this.status = 0;

				this.moveState.yawLeft = this.moveState.pitchDown = 0;

			} else {

				this.moveState.forward = 0;
				this.moveState.back = 0;

				this.updateMovementVector();

			}

			this.updateRotationVector();

		};

		this.contextMenu = function ( event ) {

			if ( this.enabled === false ) return;

			event.preventDefault();

		};

/**
 * 更新方法
 * 键盘操作移动时，实时同步target到相机前方固定距离
 */
this.update = function ( delta ) {

  if ( this.enabled === false ) return;

  const moveMult = delta * scope.movementSpeed;
  const rotMult = delta * scope.rollSpeed;

  scope.object.translateX( scope.moveVector.x * moveMult );
  scope.object.translateY( scope.moveVector.y * moveMult );
  scope.object.translateZ( scope.moveVector.z * moveMult );

  scope.tmpQuaternion.set( scope.rotationVector.x * rotMult, scope.rotationVector.y * rotMult, scope.rotationVector.z * rotMult, 1 ).normalize();
  scope.object.quaternion.multiply( scope.tmpQuaternion );

  // Q/E按键：目标点绕相机y轴旋转
  let rotated = false;
  let rotateAngle = 0;
  if (scope._rotateTargetLeft) {
    rotateAngle += 0.03 * delta * 60; // 速度可调
    rotated = true;
  }
  if (scope._rotateTargetRight) {
    rotateAngle -= 0.03 * delta * 60;
    rotated = true;
  }
  if (rotated) {
    // 目标点绕相机y轴旋转
    const offset = new Vector3().subVectors(scope.target, scope.object.position);
    const radius = Math.sqrt(offset.x * offset.x + offset.z * offset.z);
    const theta = Math.atan2(offset.z, offset.x);
    const newTheta = theta + rotateAngle;
    scope.target.x = scope.object.position.x + radius * Math.cos(newTheta);
    scope.target.z = scope.object.position.z + radius * Math.sin(newTheta);
    // y不变
    // 镜头始终看向target
    scope.object.lookAt(scope.target);
  } else {
    // 每次相机移动后，target始终保持在相机前方10单位
    const dir = new Vector3();
    scope.object.getWorldDirection(dir);
    scope.target.copy(scope.object.position).add(dir.multiplyScalar(10));
  }

  if (
    lastPosition.distanceToSquared( scope.object.position ) > EPS ||
    8 * ( 1 - lastQuaternion.dot( scope.object.quaternion ) ) > EPS
  ) {
    scope.dispatchEvent( _changeEvent );
    lastQuaternion.copy( scope.object.quaternion );
    lastPosition.copy( scope.object.position );
  }
};

		this.updateMovementVector = function () {

			const forward = ( this.moveState.forward || ( this.autoForward && ! this.moveState.back ) ) ? 1 : 0;

			this.moveVector.x = ( - this.moveState.left + this.moveState.right );
			this.moveVector.y = ( - this.moveState.down + this.moveState.up );
			this.moveVector.z = ( - forward + this.moveState.back );

			//console.log( 'move:', [ this.moveVector.x, this.moveVector.y, this.moveVector.z ] );

		};

		this.updateRotationVector = function () {

			this.rotationVector.x = ( - this.moveState.pitchDown + this.moveState.pitchUp );
			this.rotationVector.y = ( - this.moveState.yawRight + this.moveState.yawLeft );
			this.rotationVector.z = ( - this.moveState.rollRight + this.moveState.rollLeft );

			//console.log( 'rotate:', [ this.rotationVector.x, this.rotationVector.y, this.rotationVector.z ] );

		};

		this.getContainerDimensions = function () {

			if ( this.domElement != document ) {

				return {
					size: [ this.domElement.offsetWidth, this.domElement.offsetHeight ],
					offset: [ this.domElement.offsetLeft, this.domElement.offsetTop ]
				};

			} else {

				return {
					size: [ window.innerWidth, window.innerHeight ],
					offset: [ 0, 0 ]
				};

			}

		};

		this.dispose = function () {

			this.domElement.removeEventListener( 'contextmenu', _contextmenu );
			this.domElement.removeEventListener( 'pointerdown', _pointerdown );
			this.domElement.removeEventListener( 'pointermove', _pointermove );
			this.domElement.removeEventListener( 'pointerup', _pointerup );
			this.domElement.removeEventListener( 'pointercancel', _pointercancel );

			window.removeEventListener( 'keydown', _keydown );
			window.removeEventListener( 'keyup', _keyup );

		};

		const _contextmenu = this.contextMenu.bind( this );
		const _pointermove = this.pointermove.bind( this );
		const _pointerdown = this.pointerdown.bind( this );
		const _pointerup = this.pointerup.bind( this );
		const _pointercancel = this.pointercancel.bind( this );
		const _keydown = this.keydown.bind( this );
		const _keyup = this.keyup.bind( this );

		this.domElement.addEventListener( 'contextmenu', _contextmenu );
		this.domElement.addEventListener( 'pointerdown', _pointerdown );
		this.domElement.addEventListener( 'pointermove', _pointermove );
		this.domElement.addEventListener( 'pointerup', _pointerup );
		this.domElement.addEventListener( 'pointercancel', _pointercancel );

		window.addEventListener( 'keydown', _keydown );
		window.addEventListener( 'keyup', _keyup );

		this.updateMovementVector();
		this.updateRotationVector();

	}

}

export { FlyControls };
