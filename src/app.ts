/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import * as MRE from '@microsoft/mixed-reality-extension-sdk';
import { ButtonBehavior } from '@microsoft/mixed-reality-extension-sdk';

/**
 * The main class of this app. All the logic goes here.
 */
export default class HelloWorld {
	private plane: MRE.Actor = null;
	private assets: MRE.AssetContainer;

	constructor(private context: MRE.Context) {
		this.context.onStarted(() => this.started());
	}

	/**
	 * Once the context is "started", initialize the app.
	 */
	private async started() {
		// set up somewhere to store loaded assets (meshes, textures, animations, gltfs, etc.)
		this.assets = new MRE.AssetContainer(this.context);

		this.plane = MRE.Actor.CreatePrimitive(this.assets, {
			actor: {
				transform: {
					local: { 
						position: { x: 0, y: 0, z: 0 },
						rotation: MRE.Quaternion.RotationAxis(MRE.Vector3.Left(), Math.PI/2),
						scale: {x: 0.3, y: 0.3, z: 0.3}
					}
				},
			},
			definition: {shape: MRE.PrimitiveShape.Plane}
		});

		const buttonBehavior = this.plane.setBehavior(MRE.ButtonBehavior);

		buttonBehavior.onButton("holding", (user: MRE.User, event: MRE.ButtonEventData) => {
			
		});
	}
}

function v3toString(vector: MRE.Vector3Like)
{
	return `< ${vector.x}, ${vector.y}, ${vector.z} >`
}
