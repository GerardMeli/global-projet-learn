package com.example.qrcodegenetator;

import java.nio.file.Paths;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.MultiFormatWriter;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;

public class QRCodeGenerator {

    private final static int WIDTH = 250;
    private final static int HEIGHT = 250;
    
    public static void generateQRCode(String data, String path) throws Exception {
        BitMatrix matrix = new MultiFormatWriter().encode(
            data, 
            BarcodeFormat.QR_CODE,
            WIDTH, 
            HEIGHT);   
            
        MatrixToImageWriter.writeToPath(
            matrix, 
            "png", 
            Paths.get(path));
    }

}
