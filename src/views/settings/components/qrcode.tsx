import { useEffect, useRef, useState } from 'react';
import QRCodeLib from 'qrcode'; // Non-React library
import Box from '@mui/material/Box';

const NonReactQRCode = ({ url, size=150 }: { url: string; size: number }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);  // Reference to the canvas
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (url && canvasRef.current) {
      // Generate QR code using the non-React library (qrcode)
      QRCodeLib.toCanvas(canvasRef.current, url, { errorCorrectionLevel: 'H', width: size }, (err: any) => {
        if (err) {
          setError('Error generating QR code');
        }
      });
    }
  }, [url]);

  return (
    <Box sx={{ padding: 1, textAlign: 'center',}}>
      {error ? <div>{error}</div> : <canvas ref={canvasRef} />}
    </Box>
  );
};

export default NonReactQRCode;
