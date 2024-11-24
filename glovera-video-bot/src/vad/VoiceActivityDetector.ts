import OnnxWrapper from './Silero'; // Assuming you have this class implemented
import { downloadModel } from './utils'; // Assume this is where the downloadModel function is
const modelPath = "https://soulfiles007.s3.us-east-1.amazonaws.com/silero_vad.onnx";

export class VadDetector {
    private model: OnnxWrapper | null = null;
    private startThreshold: number;
    private endThreshold: number;
    private samplingRate: number;
    private minSilenceSamples: number;
    private speechPadSamples: number;
    private triggered: boolean;
    private tempEnd: number;
    private currentSample: number;

    constructor(
        startThreshold: number,
        endThreshold: number,
        samplingRate: number,
        minSilenceDurationMs: number,
        speechPadMs: number
    ) {
        if (samplingRate !== 8000 && samplingRate !== 16000) {
            throw new Error("Does not support sampling rates other than [8000, 16000]");
        }

        this.startThreshold = startThreshold;
        this.endThreshold = endThreshold;
        this.samplingRate = samplingRate;
        this.minSilenceSamples = (samplingRate * minSilenceDurationMs) / 1000;
        this.speechPadSamples = (samplingRate * speechPadMs) / 1000;
        this.triggered = false;
        this.tempEnd = 0;
        this.currentSample = 0;

        this.initModel();
    }

    private async initModel() {
        try {
            console.log('Downloading VAD model...');
            const modelData : any = await downloadModel(modelPath);
	    //const decoder = new TextDecoder('utf-8');
	    //const modelString = decoder.decode(new Uint8Array(modelData));
            this.model = new OnnxWrapper(modelData); // Assuming OnnxWrapper can take ArrayBuffer as input
            console.log('Model loaded successfully.');
        } catch (error) {
            console.error('Error downloading model:', error);
            throw new Error('Failed to initialize model');
        }
    }

    reset(): void {
        if (this.model) {
            this.model.resetStates();
        }
        this.triggered = false;
        this.tempEnd = 0;
        this.currentSample = 0;
        console.log('VadDetector reset');
    }

    async apply(data: Float32Array, returnSeconds: boolean): Promise<{ start?: number; end?: number }> {
        const windowSizeSamples = data.length;
        this.currentSample += windowSizeSamples;

        // Determine the row length based on the sampling rate
        const rowLength = this.samplingRate === 16000 ? 512 : 256;

        // Calculate the number of rows
        const numRows = Math.ceil(data.length / rowLength);

        // Create the 2D array
        const x: number[][] = [];
        for (let i = 0; i < numRows; i++) {
            const start = i * rowLength;
            const end = Math.min(start + rowLength, data.length);
            const row = Array.from(data.slice(start, end));

            // If the last row is not full, pad it with zeros
            if (end - start < rowLength) {
                row.push(...new Array(rowLength - (end - start)).fill(0));
            }

            x.push(row);
        }

        let speechProb: number;
        try {
            const speechProbPromise = await this.model.call(x, this.samplingRate);
            if (speechProbPromise && Array.isArray(speechProbPromise) && speechProbPromise[0]) {
                speechProb = speechProbPromise[0][0];
            } else {
                throw new Error("Unexpected response from model");
            }
        } catch (e) {
            console.error("Error in VadDetector.apply:", e);
            throw new Error("Error calling the model: " + e);
        }

        // Detect speech start
        if (speechProb >= this.startThreshold) {
            if (this.tempEnd !== 0) {
                this.tempEnd = 0; // Resetting tempEnd if we detect speech
            }
            if (!this.triggered) {
                this.triggered = true;
                const speechStart = Math.max(this.currentSample - this.speechPadSamples, 0);
                console.log(`Speech start detected at sample ${speechStart}`);
                return returnSeconds ? { start: Number((speechStart / this.samplingRate).toFixed(1)) } : { start: speechStart };
            }
        }

        // Detect speech end
        if (speechProb < this.endThreshold && this.triggered) {
            // console.log(`Potential speech end at sample ${this.currentSample}`);
            if (this.tempEnd === 0) {
                this.tempEnd = this.currentSample;
            }
            if (this.currentSample - this.tempEnd >= this.minSilenceSamples) {
                const speechEnd = this.tempEnd + this.speechPadSamples;
                // console.log(`Speech end confirmed at sample ${speechEnd}`);
                this.tempEnd = 0;
                this.triggered = false;
                return returnSeconds ? { end: Number((speechEnd / this.samplingRate).toFixed(1)) } : { end: speechEnd };
            }
            // console.log('Silence duration too short, continuing');
        }

        return {};
    }

    async close(): Promise<void> {
        this.reset();
        if (this.model) {
            await this.model.close();
        }
    }
}

