const https = require('https');
const fs = require('fs');

function dispatchRequest(options, body) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (c) => data += c);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

function buildMultipart(boundary, fieldName, filename, mimeType, fileBuffer, platform = 'telegram') {
  let body = "";
  body += `--${boundary}\r\n`;
  body += `Content-Disposition: form-data; name="platform"\r\n\r\n`;
  body += `${platform}\r\n`;
  body += `--${boundary}\r\n`;
  body += `Content-Disposition: form-data; name="${fieldName}"; filename="${filename}"\r\n`;
  body += `Content-Type: ${mimeType}\r\n\r\n`;

  const head = Buffer.from(body, 'utf-8');
  const tail = Buffer.from(`\r\n--${boundary}--\r\n`, 'utf-8');
  return Buffer.concat([head, fileBuffer, tail]);
}

async function main() {
  console.log("==================================================");
  console.log("1. ACCEPTANCE TEST: TEXT (POST /api/scan)");
  console.log("==================================================");
  const textPayload = JSON.stringify({
    input: "URGENT! Your SBI account will be blocked today. Verify immediately: http://amazon-account-verify.xyz/login",
    platform: "telegram"
  });

  const textRes = await dispatchRequest({
    hostname: 'truthlens-ai-1-7unv.onrender.com',
    port: 443,
    path: '/api/scan',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(textPayload)
    }
  }, textPayload);

  console.log("HTTP Status:", textRes.status);
  console.log("Scan ID:", textRes.data.scan_id);
  console.log("Risk Score:", textRes.data.risk_score);
  console.log("Severity:", textRes.data.severity);
  console.log("Threat Type:", textRes.data.threat_type);
  console.log("Timing:", textRes.data.timing);

  console.log("\n==================================================");
  console.log("2. ACCEPTANCE TEST: IMAGE (POST /api/scan/image)");
  console.log("==================================================");
  const pngBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
  const imageBuf = Buffer.from(pngBase64, "base64");
  const boundaryImg = "----WebKitBoundaryImage7MA4YWxk";
  const imageMultipart = buildMultipart(boundaryImg, "file", "invoice_check.png", "image/png", imageBuf);

  const imageRes = await dispatchRequest({
    hostname: 'truthlens-ai-1-7unv.onrender.com',
    port: 443,
    path: '/api/scan/image',
    method: 'POST',
    headers: {
      'Content-Type': `multipart/form-data; boundary=${boundaryImg}`,
      'Content-Length': imageMultipart.length
    }
  }, imageMultipart);

  console.log("HTTP Status:", imageRes.status);
  console.log("Scan ID:", imageRes.data.scan_id);
  console.log("OCR Status:", imageRes.data.ocr_status);
  console.log("Extracted Text:", repr(imageRes.data.extracted_text));
  console.log("Image Forensics:", imageRes.data.image_forensics);
  console.log("Recommendation:", imageRes.data.recommendation);

  console.log("\n==================================================");
  console.log("3. ACCEPTANCE TEST: AUDIO (POST /api/scan/audio)");
  console.log("==================================================");
  // Generate minimal valid WAV file header + silence (44 bytes standard PCM header)
  const wavHeader = Buffer.from([
    0x52, 0x49, 0x46, 0x46, // "RIFF"
    0x24, 0x00, 0x00, 0x00, // Chunk size: 36 + 0
    0x57, 0x41, 0x56, 0x45, // "WAVE"
    0x66, 0x6d, 0x74, 0x20, // "fmt "
    0x10, 0x00, 0x00, 0x00, // Subchunk1Size (16 for PCM)
    0x01, 0x00,             // AudioFormat (1 = PCM)
    0x01, 0x00,             // NumChannels (1 = Mono)
    0x80, 0x3e, 0x00, 0x00, // SampleRate (16000 Hz)
    0x00, 0x7d, 0x00, 0x00, // ByteRate (16000 * 1 * 2 = 32000)
    0x02, 0x00,             // BlockAlign (1 * 2 = 2)
    0x10, 0x00,             // BitsPerSample (16)
    0x64, 0x61, 0x74, 0x61, // "data"
    0x00, 0x00, 0x00, 0x00  // Subchunk2Size (0 bytes of data)
  ]);
  const boundaryAud = "----WebKitBoundaryAudio7MA4YWxk";
  const audioMultipart = buildMultipart(boundaryAud, "file", "voicemail_cfo.wav", "audio/wav", wavHeader);

  const audioRes = await dispatchRequest({
    hostname: 'truthlens-ai-1-7unv.onrender.com',
    port: 443,
    path: '/api/scan/audio',
    method: 'POST',
    headers: {
      'Content-Type': `multipart/form-data; boundary=${boundaryAud}`,
      'Content-Length': audioMultipart.length
    }
  }, audioMultipart);

  console.log("HTTP Status:", audioRes.status);
  console.log("Scan ID:", audioRes.data.scan_id);
  console.log("Transcript:", audioRes.data.transcript);
  console.log("Transcription:", audioRes.data.transcription);
  console.log("Audio Forensics:", audioRes.data.audio_forensics);
  console.log("Recommendation:", audioRes.data.recommendation);

  console.log("\n==================================================");
  console.log("4. ACCEPTANCE TEST: VIDEO (POST /api/scan/video)");
  console.log("==================================================");
  // Generate a minimal valid MP4 test container using ffmpeg
  const { execSync } = require('child_process');
  try {
    execSync("ffmpeg -y -f lavfi -i color=c=black:s=320x240:d=1 -f lavfi -i anullsrc=r=16000:cl=mono -t 1 -c:v libx264 -c:a aac test_clip.mp4", { stdio: 'ignore' });
    const videoBuf = fs.readFileSync("test_clip.mp4");
    const boundaryVid = "----WebKitBoundaryVideo7MA4YWxk";
    const videoMultipart = buildMultipart(boundaryVid, "file", "test_clip.mp4", "video/mp4", videoBuf);

    const videoRes = await dispatchRequest({
      hostname: 'truthlens-ai-1-7unv.onrender.com',
      port: 443,
      path: '/api/scan/video',
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundaryVid}`,
        'Content-Length': videoMultipart.length
      }
    }, videoMultipart);

    console.log("HTTP Status:", videoRes.status);
    console.log("Scan ID:", videoRes.data.scan_id);
    console.log("Video Metadata:", videoRes.data.video_metadata);
    console.log("Analysis Source:", videoRes.data.analysis_source);
    console.log("Frames count:", videoRes.data.frames ? videoRes.data.frames.length : 0);
    console.log("Video Forensics:", videoRes.data.video_forensics);
    console.log("Recommendation:", videoRes.data.recommendation);
    fs.unlinkSync("test_clip.mp4");
  } catch (err) {
    console.log("Video generation or scan test error:", err.message);
  }

  console.log("\n>>> ALL ACCEPTANCE TESTS COMPLETE <<<");
}

function repr(val) {
  return typeof val === 'string' ? `'${val}'` : val;
}

main().catch(console.error);
