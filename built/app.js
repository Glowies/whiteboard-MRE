"use strict";
/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const MRE = __importStar(require("@microsoft/mixed-reality-extension-sdk"));
/**
 * The main class of this app. All the logic goes here.
 */
class HelloWorld {
    constructor(context) {
        this.context = context;
        this.text = null;
        this.cube = null;
        this.plane = null;
        this.context.onStarted(() => this.started());
    }
    /**
     * Once the context is "started", initialize the app.
     */
    async started() {
        // set up somewhere to store loaded assets (meshes, textures, animations, gltfs, etc.)
        this.assets = new MRE.AssetContainer(this.context);
        // Create a new actor with no mesh, but some text.
        this.text = MRE.Actor.Create(this.context, {
            actor: {
                name: 'Text',
                transform: {
                    app: { position: { x: 0, y: 0.5, z: 0 } }
                },
                text: {
                    contents: "<username>",
                    anchor: MRE.TextAnchorLocation.MiddleCenter,
                    color: { r: 30 / 255, g: 206 / 255, b: 213 / 255 },
                    height: 0.3
                },
            }
        });
        this.plane = MRE.Actor.CreatePrimitive(this.assets, {
            actor: {
                transform: {
                    local: {
                        position: { x: 0, y: 0, z: 0 },
                        rotation: MRE.Quaternion.RotationAxis(MRE.Vector3.Left(), Math.PI / 2),
                        scale: { x: 0.3, y: 0.3, z: 0.3 }
                    }
                },
            },
            definition: { shape: MRE.PrimitiveShape.Plane }
        });
        // Load a glTF model before we use it
        const cubeData = await this.assets.loadGltf('altspace-cube.glb', "box");
        // spawn a copy of the glTF model
        this.cube = MRE.Actor.CreateFromPrefab(this.context, {
            // using the data we loaded earlier
            firstPrefabFrom: cubeData,
            // Also apply the following generic actor properties.
            actor: {
                name: 'Altspace Cube',
                // Parent the glTF model to the text actor, so the transform is relative to the text
                parentId: this.text.id,
                transform: {
                    local: {
                        position: { x: 0, y: -1, z: 0 },
                        scale: { x: 0.4, y: 0.4, z: 0.4 }
                    }
                },
                grabbable: true
            }
        });
        // Set up cursor interaction. We add the input behavior ButtonBehavior to the cube.
        // Button behaviors have two pairs of events: hover start/stop, and click start/stop.
        const buttonBehavior = this.cube.setBehavior(MRE.ButtonBehavior);
        // Trigger the grow/shrink animations on hover.
        buttonBehavior.onHover('enter', () => {
            // use the convenience function "AnimateTo" instead of creating the animation data in advance
            MRE.Animation.AnimateTo(this.context, this.cube, {
                destination: { transform: { local: { scale: { x: 0.5, y: 0.5, z: 0.5 } } } },
                duration: 0.3,
                easing: MRE.AnimationEaseCurves.EaseOutSine
            });
        });
        buttonBehavior.onHover('exit', () => {
            MRE.Animation.AnimateTo(this.context, this.cube, {
                destination: { transform: { local: { scale: { x: 0.4, y: 0.4, z: 0.4 } } } },
                duration: 0.3,
                easing: MRE.AnimationEaseCurves.EaseOutSine
            });
        });
        // When clicked, do a 360 sideways.
        buttonBehavior.onClick((user, event) => {
            this.text.text.contents = user.name;
            // user.prompt(`Points [${event.targetedPoints.length}]: ${v3toString(event.targetedPoints[0].appSpacePoint)}`);
            user.prompt(`${this.plane.appearance.material}`);
            this.plane.appearance.enabled = !this.plane.appearance.enabled;
            // flipAnim.play();
        });
    }
}
exports.default = HelloWorld;
function v3toString(vector) {
    return `< ${vector.x}, ${vector.y}, ${vector.z} >`;
}
//# sourceMappingURL=app.js.map