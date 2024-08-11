const player = document.querySelector("#player")
const canvas = document.querySelector("#canvas")
const context = canvas.getContext("2d")

let videoTrack;

let height = 0
let width = 0

const takeImage = async () => {
    try {
        const videoTrack = stream.getVideoTracks()[0];
    const imageCapture = new ImageCapture(videoTrack);
    const capturedImage = await imageCapture.takePhoto({imageHeight: height, imageWidth: width,})
    let dataURI = "";
    const reader = new FileReader();
    reader.readAsDataURL(capturedImage);
    reader.onloadend = () => {
        dataURI = reader.result;
        const url = "http://127.0.0.1:5000"

        fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ "filename": dataURI }),
        })
            .then(response => response.json())
            .then(data => {
                document.querySelector("#overlayImage").src = data.result
                takeImage()
            })
            .catch(error => {
                console.log("Error:", error)
                takeImage()
            })
    };
    } catch (error) {
        console.log("Error: " + error)
        takeImage()
    }
}

let cameras = []

if (!navigator.mediaDevices?.enumerateDevices) {
    console.log("enumerateDevices() not supported.")
} else {
    navigator.mediaDevices
        .enumerateDevices()
        .then((devices) => {

            devices.forEach((device) => {
                if (device.kind === "videoinput") {
                    cameras.push(device.deviceId)
                }
            })
            sourceSelected(cameras[0])
        })
        .catch((err) => {
            console.log(`${err.name}: ${err.message}`)
        })
}

let stream
let counter = 0

async function sourceSelected(videoSource) {
    stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
            deviceId: videoSource,
            width: { ideal: 4096 },
            height: { ideal: 2160 },
        },
    })
    height = stream.getVideoTracks()[0].getSettings().height
    width = stream.getVideoTracks()[0].getSettings().width
    videoTrack = stream.getVideoTracks()[0]
    player.srcObject = stream
    takeImage()
}

document.querySelector("#switch-camera").addEventListener("click", () => {
    if (counter == cameras.length - 1) {
        counter = 0
    } else {
        counter += 1
    }
    sourceSelected(cameras[counter])
})