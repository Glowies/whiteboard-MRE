import * as MRE from '@microsoft/mixed-reality-extension-sdk';

/**
 * The main class of this app. All the logic goes here.
 */
export default class Whiteboard {
	private assets: MRE.AssetContainer;
	private parentActor: MRE.Actor;
	private drawSurface: MRE.Actor = null;
	private drawMesh: MRE.Mesh;
	private pointMesh: MRE.Mesh;
	private hoverMaterial: MRE.Material;
	private drawObjects: MRE.Actor[] = [];
	private prevPt: MRE.Vector3 = null;

	constructor(private context: MRE.Context) {
		this.context.onStarted(() => this.started());
	}

	/**
	 * Once the context is "started", initialize the app.
	 */
	private async started() {
		// set up somewhere to store loaded assets (meshes, textures, animations, gltfs, etc.)
		this.assets = new MRE.AssetContainer(this.context);
		this.parentActor = MRE.Actor.Create(this.context);

		// Set up meshes
		this.drawMesh = this.assets.createCylinderMesh('cylinders', 1, .25, "y", 2);
		this.pointMesh = this.assets.createCylinderMesh('sphere', 0.01, .25, "z", 16);

		// Set up materials
		this.hoverMaterial = this.assets.createMaterial('hoverMaterial', {
			color: MRE.Color3.Magenta(),
			emissiveColor: MRE.Color3.Magenta(),
		});
		const penMat = this.assets.createMaterial('hoverMaterial', {
			color: MRE.Color3.Teal(),
		});
		
		this.drawSurface = MRE.Actor.CreatePrimitive(this.assets, {
			actor: {
				parentId: this.parentActor.id,
				transform: {
					local: { 
						position: { x: 0, y: 1, z: 0 },
						rotation: MRE.Quaternion.RotationAxis(MRE.Vector3.Left(), Math.PI/2),
						scale: {x: 3, y: 1, z: 2}
					}
				},
				collider: { geometry: { shape: MRE.ColliderType.Auto} }
			},
			definition: {shape: MRE.PrimitiveShape.Plane}
		});

		const buttonBehavior = this.drawSurface.setBehavior(MRE.ButtonBehavior);

		buttonBehavior.onButton("pressed", (user: MRE.User, data: MRE.ButtonEventData) => {
			this.spawnTargetObjects(user, data.targetedPoints.map(pt => {
				return new MRE.Vector3(pt.appSpacePoint.x, pt.appSpacePoint.y, pt.appSpacePoint.z);
			}));
		});
		
		buttonBehavior.onButton("holding", (user: MRE.User, data: MRE.ButtonEventData) => {
			this.spawnTargetObjects(user, data.targetedPoints.map(pt => {
				return new MRE.Vector3(pt.appSpacePoint.x, pt.appSpacePoint.y, pt.appSpacePoint.z);
			}));
		});

		buttonBehavior.onButton("released", () => {
			this.prevPt = null;
		});
		buttonBehavior.onHover("exit", () => {
			this.prevPt = null;
		});
	}

	private spawnTargetObjects(user: MRE.User, drawPoints: MRE.Vector3[]) {
		const materialId = this.hoverMaterial.id;
		const thicness = .05;

		const drawActors: MRE.Actor[] = [];
		drawPoints.forEach(drawPoint => {
			if(this.prevPt){
				const midPt = MRE.Vector3.Lerp(drawPoint, this.prevPt, 0.5);
				const dist = MRE.Vector3.Distance(drawPoint, this.prevPt);
				const diff = drawPoint.subtract(this.prevPt);
				const angle = Math.atan2(diff.y, diff.x);
				drawActors.push(MRE.Actor.Create(this.context, {
					actor: {
						parentId: this.parentActor.id,
						transform: { 
							app: { 
								position: {x: midPt.x, y: midPt.y, z: -0.001},
								rotation: MRE.Quaternion.RotationAxis(MRE.Vector3.Forward(), angle + Math.PI / 2).multiply(
									MRE.Quaternion.RotationAxis(MRE.Vector3.Up(), Math.PI / 2)
								),
							},
							local: {
								scale: new MRE.Vector3(thicness, dist, thicness)
							}
						},
						appearance: {
							materialId: materialId,
							meshId: this.drawMesh.id
						}
					}
				}));
			}

			drawActors.push(MRE.Actor.Create(this.context, {
				actor: {
					parentId: this.parentActor.id,
					transform: { 
						app: { 
							position: {x: drawPoint.x, y: drawPoint.y, z: -0.002},
						},
						local: {
							scale: new MRE.Vector3(thicness, thicness, thicness)
						}
					},
					appearance: {
						materialId: materialId,
						meshId: this.pointMesh.id
					}
				}
			}));

			this.prevPt = drawPoint;
		});

			// setTimeout(() => drawActors.forEach(actor => actor.destroy()), 1500);
		this.drawObjects = this.drawObjects.concat(drawActors);
	}
	
}

function v3toString(vector: MRE.Vector3Like)
{
	return `< ${vector.x}, ${vector.y}, ${vector.z} >`
}
