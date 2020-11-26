import * as MRE from '@microsoft/mixed-reality-extension-sdk';

/**
 * The main class of this app. All the logic goes here.
 */
export default class Whiteboard {
	private assets: MRE.AssetContainer;
	private drawSurface: MRE.Actor = null;
	private drawMesh: MRE.Mesh;
	private hoverMaterial: MRE.Material;
	private drawObjects: MRE.Actor[] = [];

	constructor(private context: MRE.Context) {
		this.context.onStarted(() => this.started());
	}

	/**
	 * Once the context is "started", initialize the app.
	 */
	private async started() {
		// set up somewhere to store loaded assets (meshes, textures, animations, gltfs, etc.)
		this.assets = new MRE.AssetContainer(this.context);

		this.drawMesh = this.assets.createSphereMesh('drawPoint', .01);
		this.hoverMaterial = this.assets.createMaterial('hoverMaterial', {
			color: MRE.Color3.Gray()
		});
		
		this.drawSurface = MRE.Actor.CreatePrimitive(this.assets, {
			actor: {
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

		buttonBehavior.onButton("holding", (user: MRE.User, data: MRE.ButtonEventData) => {
			this.spawnTargetObjects("draw", data.targetedPoints.map(pt => pt.localSpacePoint));
		});
	}

	private spawnTargetObjects(targetingState: 'hover' | 'draw', drawPoints: MRE.Vector3Like[]) {
		const materialId = this.hoverMaterial.id;

		const drawActors = drawPoints.map(drawPoint => {
			return MRE.Actor.Create(this.context, {
				actor: {
					name: targetingState === 'hover' ? 'hoverBall' : 'drawBall',
					parentId: this.drawSurface.id,
					transform: { local: { position: drawPoint } },
					appearance: {
						materialId: materialId,
						meshId: this.drawMesh.id
					}
				}
			});
		});

		if (targetingState === 'hover') {
			// Set lifetime timer for the hover points.
			setTimeout(() => drawActors.forEach(actor => actor.destroy()), 1500);
		} else {
			this.drawObjects = this.drawObjects.concat(drawActors);
		}
	}
}

function v3toString(vector: MRE.Vector3Like)
{
	return `< ${vector.x}, ${vector.y}, ${vector.z} >`
}
