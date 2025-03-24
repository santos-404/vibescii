"use client"

import type React from "react"

import { useState, useRef, type ChangeEvent } from "react"
import { Upload, Download, Copy, Settings, ImageIcon, Type } from "lucide-react"
import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

export default function AsciiGenerator() {
  const [asciiOutput, setAsciiOutput] = useState("")
  const [text, setText] = useState("")
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [density, setDensity] = useState(1)
  const [inverted, setInverted] = useState(false)
  const [charSet, setCharSet] = useState("standard")
  const [downloadDialogOpen, setDownloadDialogOpen] = useState(false)
  const [downloadFilename, setDownloadFilename] = useState("ascii-art.txt")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const charSets = {
    standard: "@%#*+=-:. ",
    detailed: "@MBHENR#KWXDFPQASUZbdehx*8Gm&04LOVYkpq5Tagns69owz$CIu23Jcfry%1v7l+i><!(){}/|\\t[]?_\"~;,^'. ",
    simple: "#@%=+*:-. ",
    blocks: "█▓▒░ ",
    binary: "10 ",
  }

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value)
    convertTextToAscii(e.target.value)
  }

  const convertTextToAscii = (inputText: string) => {
    // Simple text to ASCII art conversion
    // This is a basic implementation - could be enhanced with more sophisticated algorithms
    if (!inputText) {
      setAsciiOutput("")
      return
    }

    const lines = inputText.split("\n")
    let result = ""

    lines.forEach((line) => {
      let asciiLine = ""
      for (let i = 0; i < line.length; i++) {
        const charCode = line.charCodeAt(i)
        const index = charCode % charSets[charSet as keyof typeof charSets].length
        asciiLine += charSets[charSet as keyof typeof charSets][index]
      }
      result += asciiLine + "\n"
    })

    setAsciiOutput(result)
  }

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.crossOrigin = "anonymous"
      img.onload = () => {
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")
        if (!ctx) return

        // Set dimensions based on aspect ratio
        const maxWidth = 100 // Limit width for reasonable ASCII output
        const scale = maxWidth / img.width
        canvas.width = maxWidth
        canvas.height = img.height * scale

        // Draw image to canvas
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

        // Get image data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const pixels = imageData.data

        // Convert to ASCII
        let ascii = ""
        const chars = charSets[charSet as keyof typeof charSets]

        for (let y = 0; y < canvas.height; y += density) {
          for (let x = 0; x < canvas.width; x += density * 0.5) {
            const idx = (Math.floor(y) * canvas.width + Math.floor(x)) * 4
            const brightness = (pixels[idx] + pixels[idx + 1] + pixels[idx + 2]) / 3 / 255

            // Map brightness to character
            const charIndex = inverted
              ? Math.floor((1 - brightness) * (chars.length - 1))
              : Math.floor(brightness * (chars.length - 1))

            ascii += chars[charIndex]
          }
          ascii += "\n"
        }

        setAsciiOutput(ascii)
        setImagePreview(event.target?.result as string)
      }
      img.src = event.target?.result as string
    }
    reader.readAsDataURL(file)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(asciiOutput)
    toast({
      title: "Copied to clipboard",
      description: "ASCII art has been copied to your clipboard",
    })
  }

  const handleDownload = () => {
    setDownloadFilename("ascii-art.txt")
    setDownloadDialogOpen(true)
  }

  const handleDownloadConfirm = () => {
    const element = document.createElement("a")
    const file = new Blob([asciiOutput], { type: "text/plain" })
    element.href = URL.createObjectURL(file)
    element.download = downloadFilename.endsWith(".txt") ? downloadFilename : `${downloadFilename}.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
    setDownloadDialogOpen(false)
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    const imageFile = files.find(file => file.type.startsWith('image/'))
    
    if (imageFile) {
      const input = fileInputRef.current
      if (input) {
        const dataTransfer = new DataTransfer()
        dataTransfer.items.add(imageFile)
        input.files = dataTransfer.files
        handleImageUpload({ target: { files: dataTransfer.files } } as any)
      }
    } else {
      toast({
        title: "Invalid file type",
        description: "Please drop an image file",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <header className="border-b border-gray-800 p-4 min-h-[72px] flex items-center">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
            ASCII Generator
          </h1>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent className="bg-gray-950 border-gray-800">
              <SheetHeader>
                <SheetTitle className="text-white">Settings</SheetTitle>
                <SheetDescription>Customize your ASCII art generation</SheetDescription>
              </SheetHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="density">Density</Label>
                  <Slider
                    id="density"
                    min={0.5}
                    max={3}
                    step={0.1}
                    value={[density]}
                    onValueChange={(value) => setDensity(value[0])}
                  />
                  <div className="text-xs text-gray-400">{density.toFixed(1)} (Lower = More detail)</div>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="inverted">Invert Colors</Label>
                  <Switch id="inverted" checked={inverted} onCheckedChange={setInverted} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="charset">Character Set</Label>
                  <Select value={charSet} onValueChange={setCharSet}>
                    <SelectTrigger id="charset">
                      <SelectValue placeholder="Select character set" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="detailed">Detailed</SelectItem>
                      <SelectItem value="simple">Simple</SelectItem>
                      <SelectItem value="blocks">Blocks</SelectItem>
                      <SelectItem value="binary">Binary</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <main className="flex-1 container mx-auto p-4">
        <Tabs defaultValue="text" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8 gap-4">
            <TabsTrigger value="text" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500/20 data-[state=active]:to-pink-500/20 hover:bg-gradient-to-r hover:from-purple-500/10 hover:to-pink-500/10 transition-all duration-200 cursor-pointer">
              <Type className="h-4 w-4" />
              Text to ASCII
            </TabsTrigger>
            <TabsTrigger value="image" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500/20 data-[state=active]:to-pink-500/20 hover:bg-gradient-to-r hover:from-purple-500/10 hover:to-pink-500/10 transition-all duration-200 cursor-pointer">
              <ImageIcon className="h-4 w-4" />
              Image to ASCII
            </TabsTrigger>
          </TabsList>

          <TabsContent value="text" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 items-start">
              <div className="space-y-2 min-h-[32px]">
                <div className="min-h-[32px] flex items-center">
                  <Label htmlFor="input-text">Input Text</Label>
                </div>
                <Textarea
                  id="input-text"
                  placeholder="Type something here..."
                  className="h-64 font-mono text-xs leading-[1.2] bg-gray-900 border-gray-800"
                  value={text}
                  onChange={handleTextChange}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center min-h-[32px]">
                  <Label htmlFor="output-ascii">ASCII Output</Label>
                  <div className="space-x-2">
                    <Button variant="outline" size="sm" onClick={handleCopy} disabled={!asciiOutput}>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleDownload} disabled={!asciiOutput}>
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
                <Textarea
                  id="output-ascii"
                  readOnly
                  className="h-64 font-mono text-xs leading-[1.2] bg-gray-900 border-gray-800"
                  value={asciiOutput}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="image" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="min-h-[32px] flex items-center">
                    <Label>Upload Image</Label>
                  </div>
                  <div
                    className={cn(
                      "flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-12 cursor-pointer hover:bg-gray-900/50 transition-colors",
                      isDragging ? "border-purple-500 bg-gray-900/50" : "border-gray-700",
                    )}
                    onClick={triggerFileInput}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <Input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                    <Upload className="h-8 w-8 mb-4 text-gray-500" />
                    <p className="text-sm text-gray-400">Click to upload or drag and drop</p>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 5MB</p>
                  </div>
                </div>

                {imagePreview && (
                  <div className="space-y-2">
                    <Label>Preview</Label>
                    <div className="border border-gray-800 rounded-lg overflow-hidden">
                      <img
                        src={imagePreview || "/placeholder.svg"}
                        alt="Preview"
                        className="max-h-64 mx-auto object-contain"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center min-h-[32px]">
                  <Label htmlFor="output-ascii-image">ASCII Output</Label>
                  <div className="space-x-2">
                    <Button variant="outline" size="sm" onClick={handleCopy} disabled={!asciiOutput}>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleDownload} disabled={!asciiOutput}>
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
                <Textarea
                  id="output-ascii-image"
                  readOnly
                  className="h-64 font-mono text-xs bg-gray-900 border-gray-800"
                  value={asciiOutput}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>


      <Dialog open={downloadDialogOpen} onOpenChange={setDownloadDialogOpen}>
        <DialogContent className="bg-gray-950 border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-white">Download ASCII Art</DialogTitle>
            <DialogDescription>Enter a filename for your ASCII art</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={downloadFilename}
              onChange={(e) => setDownloadFilename(e.target.value)}
              className="bg-gray-900 border-gray-800"
              placeholder="Enter filename"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDownloadDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleDownloadConfirm}>
              Download
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Toaster />
    </div>
  )
}

