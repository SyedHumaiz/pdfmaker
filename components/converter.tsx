"use client"

import type React from "react"
import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, Download, ArrowRight, FileImage, FileText, Music, Video, CheckCircle } from "lucide-react"

const formatCategories = [
  {
    name: "Images",
    icon: FileImage,
    formats: ["JPEG", "PNG", "WebP", "GIF", "BMP"],
    supported: true,
  },
  {
    name: "Documents",
    icon: FileText,
    formats: ["PDF", "DOCX", "TXT", "RTF", "ODT"],
    supported: false,
  },
  {
    name: "Audio",
    icon: Music,
    formats: ["MP3", "WAV", "FLAC", "AAC", "OGG"],
    supported: false,
  },
  {
    name: "Video",
    icon: Video,
    formats: ["MP4", "AVI", "MOV", "MKV", "WebM"],
    supported: false,
  },
]

const supportedImageFormats = ["JPEG", "JPG", "PNG", "WEBP", "GIF", "BMP"]

export default function Converter() {
  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fromFormat, setFromFormat] = useState("")
  const [toFormat, setToFormat] = useState("")
  const [isConverting, setIsConverting] = useState(false)
  const [convertedFile, setConvertedFile] = useState<string | null>(null)
  const [conversionComplete, setConversionComplete] = useState(false)

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      setSelectedFile(file)
      const extension = file.name.split(".").pop()?.toUpperCase()
      if (extension) {
        setFromFormat(extension === "JPG" ? "JPEG" : extension)
      }
      setConversionComplete(false)
      setConvertedFile(null)
    }
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setSelectedFile(file)
      const extension = file.name.split(".").pop()?.toUpperCase()
      if (extension) {
        setFromFormat(extension === "JPG" ? "JPEG" : extension)
      }
      setConversionComplete(false)
      setConvertedFile(null)
    }
  }

  const convertImage = async (file: File, targetFormat: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      const img = new Image()

      img.crossOrigin = "anonymous"

      img.onload = () => {
        canvas.width = img.width
        canvas.height = img.height

        if (ctx) {
          // Fill with white background for JPEG (since JPEG doesn't support transparency)
          if (targetFormat === "JPEG") {
            ctx.fillStyle = "white"
            ctx.fillRect(0, 0, canvas.width, canvas.height)
          }

          ctx.drawImage(img, 0, 0)

          const mimeType =
            targetFormat === "JPEG"
              ? "image/jpeg"
              : targetFormat === "PNG"
                ? "image/png"
                : targetFormat === "WEBP"
                  ? "image/webp"
                  : "image/png"

          const quality = targetFormat === "JPEG" ? 0.9 : undefined
          const dataUrl = canvas.toDataURL(mimeType, quality)
          resolve(dataUrl)
        } else {
          reject(new Error("Could not get canvas context"))
        }
      }

      img.onerror = () => reject(new Error("Could not load image"))
      img.src = URL.createObjectURL(file)
    })
  }

  const handleConvert = async () => {
    if (!selectedFile || !toFormat) return

    // Check if conversion is supported
    if (!supportedImageFormats.includes(fromFormat) || !supportedImageFormats.includes(toFormat)) {
      alert("This format combination is not supported yet. Currently supporting: JPEG, PNG, WebP, GIF, BMP")
      return
    }

    setIsConverting(true)

    try {
      const convertedDataUrl = await convertImage(selectedFile, toFormat)
      setConvertedFile(convertedDataUrl)
      setConversionComplete(true)
    } catch (error) {
      console.error("Conversion failed:", error)
      alert("Conversion failed. Please try again.")
    } finally {
      setIsConverting(false)
    }
  }

  const handleDownload = () => {
    if (!convertedFile || !selectedFile) return

    const link = document.createElement("a")
    link.href = convertedFile
    const originalName = selectedFile.name.split(".").slice(0, -1).join(".")
    const extension = toFormat.toLowerCase() === "jpeg" ? "jpg" : toFormat.toLowerCase()
    link.download = `${originalName}_converted.${extension}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const resetConverter = () => {
    setSelectedFile(null)
    setFromFormat("")
    setToFormat("")
    setConvertedFile(null)
    setConversionComplete(false)
  }

  const isImageFormat = supportedImageFormats.includes(fromFormat)
  const availableFormats = isImageFormat ? supportedImageFormats : []

  return (
    <section className="container py-24 md:py-32">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="text-center space-y-4">
          <h2 className="font-bold text-3xl leading-[1.1] sm:text-3xl md:text-4xl">Upload & Convert Your Files</h2>
          <p className="text-muted-foreground sm:text-lg">
            Drag and drop your image file or click to browse. Currently supporting image conversions.
          </p>
        </div>

        <Card className="border-2 border-dashed border-muted-foreground/25">
          <CardContent className="p-8">
            {!conversionComplete ? (
              <>
                <div
                  className={`relative rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
                    dragActive
                      ? "border-primary bg-primary/5"
                      : "border-muted-foreground/25 hover:border-muted-foreground/50"
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleFileSelect}
                    accept="image/*"
                  />

                  {selectedFile ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-center w-16 h-16 mx-auto bg-primary/10 rounded-full">
                        <FileImage className="w-8 h-8 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{selectedFile.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        {!isImageFormat && (
                          <p className="text-sm text-red-500 mt-2">
                            This format is not supported yet. Please upload an image file.
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-center w-16 h-16 mx-auto bg-muted rounded-full">
                        <Upload className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-lg font-medium">Drop your image here</p>
                        <p className="text-muted-foreground">or click to browse</p>
                        <p className="text-sm text-muted-foreground mt-2">Supports: JPEG, PNG, WebP, GIF, BMP</p>
                      </div>
                    </div>
                  )}
                </div>

                {selectedFile && isImageFormat && (
                  <div className="mt-8 space-y-6">
                    <div className="flex items-center justify-center gap-4">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground mb-2">From</p>
                        <div className="px-4 py-2 bg-muted rounded-lg font-medium">{fromFormat}</div>
                      </div>
                      <ArrowRight className="w-6 h-6 text-muted-foreground" />
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground mb-2">To</p>
                        <select
                          value={toFormat}
                          onChange={(e) => setToFormat(e.target.value)}
                          className="px-4 py-2 bg-background border rounded-lg font-medium min-w-[100px]"
                        >
                          <option value="">Select format</option>
                          {availableFormats
                            .filter((format) => format !== fromFormat)
                            .map((format) => (
                              <option key={format} value={format}>
                                {format}
                              </option>
                            ))}
                        </select>
                      </div>
                    </div>

                    <div className="text-center">
                      <Button
                        onClick={handleConvert}
                        disabled={!toFormat || isConverting}
                        size="lg"
                        className="min-w-[200px]"
                      >
                        {isConverting ? (
                          <>Converting...</>
                        ) : (
                          <>
                            Convert Image
                            <ArrowRight className="ml-2 w-4 h-4" />
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center space-y-6">
                <div className="flex items-center justify-center w-16 h-16 mx-auto bg-green-500/10 rounded-full">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-green-500 mb-2">Conversion Complete!</h3>
                  <p className="text-muted-foreground">
                    Your file has been converted from {fromFormat} to {toFormat}
                  </p>
                </div>
                <div className="flex gap-4 justify-center">
                  <Button onClick={handleDownload} size="lg">
                    <Download className="mr-2 w-4 h-4" />
                    Download File
                  </Button>
                  <Button onClick={resetConverter} variant="outline" size="lg">
                    Convert Another
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {formatCategories.map((category) => (
            <Card
              key={category.name}
              className={`p-4 text-center ${category.supported ? "border-green-500/20 bg-green-500/5" : "opacity-60"}`}
            >
              <category.icon
                className={`w-8 h-8 mx-auto mb-2 ${category.supported ? "text-green-500" : "text-muted-foreground"}`}
              />
              <h3 className="font-medium mb-2">{category.name}</h3>
              <p className="text-xs text-muted-foreground mb-2">
                {category.formats.slice(0, 3).join(", ")}
                {category.formats.length > 3 && ` +${category.formats.length - 3} more`}
              </p>
              {category.supported ? (
                <span className="text-xs text-green-500 font-medium">✓ Available</span>
              ) : (
                <span className="text-xs text-muted-foreground">Coming Soon</span>
              )}
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
