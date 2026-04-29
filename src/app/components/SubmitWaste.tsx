import { useState } from "react";
import { Camera, Upload, CheckCircle2, Coins, Info, AlertCircle, Loader2 } from "lucide-react";
import { useUser } from "../context/UserContext";

const wasteTypes = [
  { id: "plastic", name: "Plastic", pointsPerItem: 50, color: "#2d7a4f" },
  { id: "paper", name: "Paper/Cardboard", pointsPerItem: 40, color: "#52b788" },
  { id: "metal", name: "Metal/Cans", pointsPerItem: 60, color: "#74c69d" },
  { id: "glass", name: "Glass", pointsPerItem: 45, color: "#95d5b2" },
  { id: "electronics", name: "Electronics", pointsPerItem: 100, color: "#2d7a4f" },
  { id: "organic", name: "Organic Waste", pointsPerItem: 30, color: "#52b788" },
];

interface VerificationResult {
  isWaste: boolean;
  correctType: boolean;
  detectedType?: string;
  confidence: number;
  message: string;
}

export function SubmitWaste() {
  const { addPoints } = useUser();
  const [selectedType, setSelectedType] = useState<string>("");
  const [itemCount, setItemCount] = useState<string>("");
  const [image, setImage] = useState<string>("");
  const [submitted, setSubmitted] = useState(false);
  const [calculatedPoints, setCalculatedPoints] = useState(0);
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);

  const handleItemCountChange = (value: string, typeOverride?: string) => {
    setItemCount(value);
    const currentType = typeOverride || selectedType;
    if (currentType && value) {
      const type = wasteTypes.find((t) => t.id === currentType);
      if (type) {
        setCalculatedPoints(Math.floor(parseInt(value) * type.pointsPerItem));
      }
    }
  };

  // AI image verification using local FastAPI backend
  const verifyImage = async () => {
    if (!image || !selectedType || !itemCount) {
      alert("Please enter a quantity before verifying.");
      return;
    }

    setVerifying(true);
    setVerificationResult(null);

    try {
      // Convert base64 to blob
      const arr = image.split(',');
      const mimeMatch = arr[0].match(/:(.*?);/);
      const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      const blob = new Blob([u8arr], { type: mime });

      const formData = new FormData();
      formData.append('file', blob, 'upload.jpg');

      const apiUrl = import.meta.env.VITE_AI_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/predict`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();
      
      const wasteTypeNames: { [key: string]: string } = {
        plastic: "Plastic",
        paper: "Paper/Cardboard",
        metal: "Metal/Cans",
        glass: "Glass",
        electronics: "Electronics",
        organic: "Organic Waste",
      };

      if (!data.is_waste || !data.counts) {
        setVerificationResult({
          isWaste: false,
          correctType: false,
          confidence: 0,
          message: `❌ ${data.message || "This doesn't appear to be waste. Please upload a clear image."}`,
        });
        return;
      }

      // Sum up the counts of all YOLO classes that map to the selectedType
      let detectedCount = 0;
      let primaryDetectedTypeMapped = "";
      
      // Determine the primary detected type just in case
      if (data.detected_class) {
        const det = data.detected_class.toLowerCase();
        if (det.includes("plastic") || det.includes("bottle")) primaryDetectedTypeMapped = "plastic";
        else if (det.includes("paper") || det.includes("cardboard")) primaryDetectedTypeMapped = "paper";
        else if (det.includes("metal") || det.includes("can") || det.includes("tin")) primaryDetectedTypeMapped = "metal";
        else if (det.includes("glass")) primaryDetectedTypeMapped = "glass";
        else if (det.includes("biodegradable") || det.includes("organic")) primaryDetectedTypeMapped = "organic";
        else primaryDetectedTypeMapped = det;
      }

      for (const [key, value] of Object.entries(data.counts)) {
        const det = key.toLowerCase();
        let mapped = "";
        if (det.includes("plastic") || det.includes("bottle")) mapped = "plastic";
        else if (det.includes("paper") || det.includes("cardboard")) mapped = "paper";
        else if (det.includes("metal") || det.includes("can") || det.includes("tin")) mapped = "metal";
        else if (det.includes("glass")) mapped = "glass";
        else if (det.includes("biodegradable") || det.includes("organic")) mapped = "organic";
        else mapped = det;

        if (mapped === selectedType) {
          detectedCount += (value as number);
        }
      }

      const expectedCount = parseInt(itemCount);

      if (detectedCount === expectedCount) {
        setVerificationResult({
          isWaste: true,
          correctType: true,
          confidence: data.confidence,
          message: `✅ Verified! AI detected exactly ${detectedCount} ${wasteTypeNames[selectedType]} item(s). You can submit now.`,
        });
      } else if (detectedCount > 0) {
        setVerificationResult({
          isWaste: true,
          correctType: false,
          detectedType: selectedType,
          confidence: data.confidence,
          message: `⚠️ Count mismatch! You entered ${expectedCount}, but AI detected ${detectedCount} item(s) of ${wasteTypeNames[selectedType]}. (Debug: AI saw ${JSON.stringify(data.counts)})`,
        });
      } else {
        setVerificationResult({
          isWaste: true,
          correctType: false,
          detectedType: primaryDetectedTypeMapped,
          confidence: data.confidence,
          message: `⚠️ AI did not detect any ${wasteTypeNames[selectedType]}. It mostly sees ${wasteTypeNames[primaryDetectedTypeMapped] || data.original_class_name}.`,
        });
      }

    } catch (error) {
      console.error("Verification error:", error);
      // AI server not available — skip verification and allow submission
      setVerificationResult({
        isWaste: true,
        correctType: true,
        confidence: 100,
        message: "⚠️ AI server is offline. Verification skipped — you can still submit.",
      });
    } finally {
      setVerifying(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Block if image is uploaded but verification not done yet
    if (image && !verificationResult) {
      alert("Please verify your image with AI before submitting.");
      return;
    }

    // Block if verification failed
    if (verificationResult && (!verificationResult.isWaste || !verificationResult.correctType)) {
      alert("AI verification did not pass. Please check your image, waste type, and quantity.");
      return;
    }

    if (selectedType && itemCount) {
      // Add points to user context with waste type
      const typeName = wasteTypes.find(t => t.id === selectedType)?.name || selectedType;
      await addPoints(calculatedPoints, parseInt(itemCount), typeName);

      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setSelectedType("");
        setItemCount("");
        setImage("");
        setCalculatedPoints(0);
        setVerificationResult(null);
      }, 3000);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setVerificationResult(null); // Reset verification when new image is uploaded
      };
      reader.readAsDataURL(file);
    }
  };

  if (submitted) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-12 h-12 text-primary" />
          </div>
          <h2 className="text-2xl text-foreground">Submission Successful! 🎉</h2>
          <p className="text-muted-foreground">You earned {calculatedPoints} points!</p>
          <div className="pt-4">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg">
              <Coins className="w-5 h-5" />
              <span>+{calculatedPoints} Points</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20 md:pb-6">
      <div>
        <h1 className="text-foreground mb-2">Submit Waste</h1>
        <p className="text-muted-foreground">
          Upload details about your recyclable waste and earn points!
        </p>
      </div>

      {/* Info Banner */}
      <div className="bg-secondary border border-primary/20 rounded-xl p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
        <div className="text-sm text-foreground">
          <p>Make sure your waste is clean and properly sorted for maximum points.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Waste Type Selection */}
        <div className="bg-card rounded-xl p-6 border border-border">
          <h3 className="mb-4 text-card-foreground">Select Waste Type</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {wasteTypes.map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={() => {
                  setSelectedType(type.id);
                  handleItemCountChange(itemCount, type.id);
                }}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  selectedType === type.id
                    ? "border-primary bg-primary/5"
                    : "border-border bg-background hover:border-primary/30"
                }`}
              >
                <div className="text-card-foreground mb-1">{type.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Quantity Input */}
        <div className="bg-card rounded-xl p-6 border border-border">
          <h3 className="mb-4 text-card-foreground">Enter Quantity</h3>
          <div className="space-y-4">
            <div>
              <label className="block mb-2 text-muted-foreground">Quantity (items)</label>
              <input
                type="number"
                step="1"
                min="1"
                value={itemCount}
                onChange={(e) => handleItemCountChange(e.target.value)}
                placeholder="0"
                className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            {calculatedPoints > 0 && (
              <div className="flex items-center gap-2 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <Coins className="w-5 h-5 text-primary" />
                <span className="text-card-foreground">
                  You'll earn <span className="text-primary">{calculatedPoints} points</span>
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Image Upload */}
        <div className="bg-card rounded-xl p-6 border border-border">
          <h3 className="mb-4 text-card-foreground">Upload Photo (Optional)</h3>
          <div className="space-y-4">
            {!image ? (
              <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-secondary transition-colors">
                <div className="flex flex-col items-center gap-2">
                  <Camera className="w-8 h-8 text-muted-foreground" />
                  <span className="text-muted-foreground">Click to upload photo</span>
                  <span className="text-sm text-muted-foreground">PNG, JPG up to 10MB</span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="space-y-3">
                <div className="relative">
                  <img
                    src={image}
                    alt="Waste preview"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImage("");
                      setVerificationResult(null);
                    }}
                    className="absolute top-2 right-2 bg-destructive text-destructive-foreground px-3 py-1 rounded-lg text-sm"
                  >
                    Remove
                  </button>
                </div>

                {/* Verify Button */}
                {!verificationResult && !verifying && (
                  <button
                    type="button"
                    onClick={verifyImage}
                    disabled={!selectedType}
                    className="w-full bg-primary text-primary-foreground py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Camera className="w-5 h-5" />
                    Verify Image with AI
                  </button>
                )}

                {/* Verifying State */}
                {verifying && (
                  <div className="flex items-center justify-center gap-3 p-4 bg-secondary rounded-lg">
                    <Loader2 className="w-5 h-5 text-primary animate-spin" />
                    <span className="text-foreground">Verifying image...</span>
                  </div>
                )}

                {/* Verification Result */}
                {verificationResult && (
                  <div
                    className={`p-4 rounded-lg border-2 ${
                      verificationResult.isWaste && verificationResult.correctType
                        ? "bg-primary/5 border-primary/30"
                        : "bg-destructive/5 border-destructive/30"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {verificationResult.isWaste && verificationResult.correctType ? (
                        <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <p className="text-foreground mb-2">{verificationResult.message}</p>
                        <div className="text-sm text-muted-foreground">
                          Confidence: {verificationResult.confidence}%
                        </div>
                        <button
                          type="button"
                          onClick={verifyImage}
                          className="mt-3 text-sm text-primary hover:underline"
                        >
                          Verify again
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        {!image && (
          <p className="text-sm text-amber-600 text-center">📷 Please upload a photo of your waste for AI verification.</p>
        )}
        {image && !verificationResult && (
          <p className="text-sm text-amber-600 text-center">⚠️ Please verify your image with AI before submitting.</p>
        )}
        {verificationResult && (!verificationResult.isWaste || !verificationResult.correctType) && (
          <p className="text-sm text-red-500 text-center">❌ AI verification did not pass. Fix issues above before submitting.</p>
        )}
        <button
          type="submit"
          disabled={
            !selectedType ||
            !itemCount ||
            !image ||
            !verificationResult ||
            !verificationResult.isWaste ||
            !verificationResult.correctType
          }
          className="w-full bg-primary text-primary-foreground py-4 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Upload className="w-5 h-5" />
          Submit Waste
        </button>
      </form>
    </div>
  );
}
