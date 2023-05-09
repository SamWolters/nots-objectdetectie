import { Camera, CameraType } from 'expo-camera';
import { cameraWithTensors } from '@tensorflow/tfjs-react-native';
import { StatusBar } from 'expo-status-bar';
import { Dimensions, Platform, StyleSheet, Text, View } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import * as tf from '@tensorflow/tfjs';
// import Canvas from 'react-native-canvas';

const TensorFlowCamera = cameraWithTensors(Camera);
const { width, height } = Dimensions.get('window');

export default function App() {
	let textureDims = Platform.OS == 'ios' ? { height: 1920, width: 1080 } : { height: 1200, width: 1600 };
	const [type, setType] = useState(CameraType.back);
	const [model, setModel] = useState<cocoSsd.ObjectDetection>();

	// let context = useRef<CanvasRenderingContext2D>();
	// let canvas = useRef<Canvas>();

	const toggleCameraType = () => setType(current => (current === CameraType.back ? CameraType.front : CameraType.back));

	useEffect(() => {
		(async () => {
			const { status } = await Camera.requestCameraPermissionsAsync();
			console.log('status', status)

			await tf.ready()
			console.log('tf ready')

			// const m = await tf.loadGraphModel("https://raw.githubusercontent.com/hugozanini/TFJS-object-detection/master/models/kangaroo-detector/model.json");
			// setM
			setModel(await cocoSsd.load());
			// console.log('model', model)
		})();
	}, []);

	const handleCameraStream = (images: any) => {
		const loop = async () => {
			console.log('loop')
			const nextImageTensor = images.next().value;

			if (!model || !nextImageTensor) throw new Error('Model or Tensor is not ready');

			model.detect(nextImageTensor)
				.then(predictions => {
					drawRectangle(predictions, nextImageTensor);
					console.log(predictions);
				})
				.catch(err => {
					console.log(err);
				});
			requestAnimationFrame(loop);
		}
		loop();
	};

	const drawRectangle = (predictions: cocoSsd.DetectedObject[], nextImageTensor: any) => {
		// if (!context.current || !canvas.current) return;

		// const scaleWidth = canvas.current.width / nextImageTensor.shape[1];
		// const scaleHeight = canvas.current.height / nextImageTensor.shape[0];

		// const flipHorizontal = Platform.OS === 'ios' ? false : true;

		// context.current.clearRect(0, 0, width, height);

		predictions.forEach(prediction => {
			const [x, y, width, height] = prediction.bbox;

			console.log(prediction, prediction.class)

			// const boundingBoxX = flipHorizontal ? canvas.current.width - x * scaleWidth - width * scaleWidth : x * scaleWidth;
			// const boundingBoxY = y * scaleHeight;

			// context.current.strokeRect(boundingBoxX, boundingBoxY, width * scaleWidth, height * scaleHeight)

			// context.current.strokeText(prediction.class, boundingBoxX -5, boundingBoxY -5);
		});
	};

	// const handleCanvas = async (canvas: Canvas) => {
	// 	if (!canvas) return;

	// 	canvas.width = width;
	// 	canvas.height = height;
	// 	const ctx: CanvasRenderingContext2D = canvas.getContext('2d');
	// 	ctx.strokeStyle = 'red';
	// 	ctx.lineWidth = 2;

	// 	context.current = ctx;
	// 	canvas.current = canvas;
	// };


	return (
		<View style={styles.container}>
			<TensorFlowCamera style={styles.camera}
				type={type}
				cameraTextureHeight={textureDims.height}
				cameraTextureWidth={textureDims.width}
				resizeHeight={200}
				resizeWidth={152}
				resizeDepth={3}
				onReady={handleCameraStream}
				autorender={true}
				useCustomShadersToResize={false}
			/>
			{/* <Canvas style={styles.canvas} ref={handleCanvas} /> */}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fff',
		alignItems: 'center',
		justifyContent: 'center',
	},
	camera: {
		width: '100%',
		height: '100%',
	},
	canvas: {
		position: 'absolute',
		zIndex: 2,
		width: '100%',
		height: '100%',
	}
});