import WebSocket from "ws";
import fetch from "node-fetch";
import mic from "mic";
import dotenv from "dotenv";

dotenv.config();

const gladiaApiUrl = "https://api.gladia.io";
const gladiaKey = process.env.GLADIA_KEY;

if (!gladiaKey) {
    console.error("❌ Erreur : Clé API Gladia manquante. Vérifie ton fichier .env !");
    process.exit(1);
}

console.log("✅ Clé API trouvée, initialisation en cours...");

// Configuration des options
const AUDIO_CONFIG = {
    bit_depth: 16, // Options: 8, 16, 24, 32
    sample_rate: 16000, // Options: 8000, 16000, 32000, 44100, 48000
    sentiment_analysis: true // Active l'analyse de sentiment en temps réel
};

// 📌 Fonction pour initier une session avec Gladia
async function initLiveSession() {
    console.log("🔄 Envoi de la requête à l'API Gladia...");
    const response = await fetch(`${gladiaApiUrl}/v2/live`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-GLADIA-KEY": gladiaKey,
        },
        body: JSON.stringify({
            encoding: "wav/pcm",
            sample_rate: AUDIO_CONFIG.sample_rate,
            bit_depth: AUDIO_CONFIG.bit_depth,
            realtime_processing: {
                sentiment_analysis: AUDIO_CONFIG.sentiment_analysis
            }
        }),
    });

    if (!response.ok) {
        console.error(`❌ Erreur ${response.status}: ${await response.text()}`);
        process.exit(response.status);
    }

    const data = await response.json();
    console.log("✅ Session initiée avec succès :", data);
    return data;
}

// 📌 Fonction pour capturer le son du micro
function initMicrophoneRecorder(onData, onStop) {
    console.log("🎤 Initialisation du microphone...");

    const microphone = mic({
        rate: AUDIO_CONFIG.sample_rate.toString(),
        channels: "1",
        bitwidth: AUDIO_CONFIG.bit_depth.toString(),
        encoding: "signed-integer",
        debug: true,
        exitOnSilence: false
    });

    const micStream = microphone.getAudioStream();
    micStream.on("data", (chunk) => {
        console.log("🎙️ Capture d'un chunk audio...");
        onData(chunk);
    });
    micStream.on("end", () => {
        console.log("⏹️ Fin de l'enregistrement !");
        onStop();
    });

    return {
        start: () => {
            console.log("▶️ Début de l'enregistrement...");
            microphone.start();
        },
        stop: () => {
            console.log("⏸️ Arrêt du micro...");
            microphone.stop();
        },
    };
}

// 📌 Fonction principale
async function start() {
    console.log("🚀 Démarrage du script...");

    const initiateResponse = await initLiveSession();
    let socket = null;

    console.log("📡 Connexion au WebSocket...");
    socket = new WebSocket(initiateResponse.url);

    socket.on("open", () => {
        console.log("✅ WebSocket connecté !");

        const recorder = initMicrophoneRecorder(
            (chunk) => socket.send(chunk),
            () => socket.send(JSON.stringify({ type: "stop_recording" }))
        );

        recorder.start();

        setTimeout(() => {
            console.log("⏹️ Arrêt après 1 minute...");
            recorder.stop();
            socket.close();
        }, 60000);
    });

    socket.on("message", (event) => {
        const message = JSON.parse(event.toString());
        console.log("📝 Transcription :", message.data?.utterance?.text || message);
        
        if (message.type === "sentiment_analysis" && message.data?.results) {
            const sentimentResults = message.data.results.map(result => result.sentiment).join(", ");
            console.log("😊 Analyse de sentiment :", sentimentResults || "Aucune donnée de sentiment trouvée");
        }
    });

    socket.on("error", (error) => console.error("❌ Erreur WebSocket :", error));
    socket.on("close", (code, reason) => console.log(`🔌 WebSocket fermé (Code: ${code}, Raison: ${reason})`));
}

// 🔥 Démarrage du script
start();
