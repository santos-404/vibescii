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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import Image from "next/image"

export default function AsciiGenerator() {
  const [asciiOutput, setAsciiOutput] = useState("")
  const [text, setText] = useState("")
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [density, setDensity] = useState(1)
  const [inverted, setInverted] = useState(false)
  const [charSet, setCharSet] = useState("standard")
  const [downloadDialogOpen, setDownloadDialogOpen] = useState(false)
  const [downloadFilename, setDownloadFilename] = useState("ascii-art.txt")
  const [activeTab, setActiveTab] = useState("image")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [hasOpenedSettings, setHasOpenedSettings] = useState(false)

  const charSets = {
    standard: "@%#*+=-:. ",
    detailed: "@MBHENR#KWXDFPQASUZbdehx*8Gm&04LOVYkpq5Tagns69owz$CIu23Jcfry%1v7l+i><!(){}/|\\t[]?_\"~;,^'. ",
    simple: "#@%=+*:-. ",
    blocks: "█▓▒░ ",
    binary: "10 ",
  }

  const resetState = () => {
    setAsciiOutput("")
    setText("")
    setImagePreview(null)
    setDensity(1)
    setInverted(false)
    setCharSet("standard")
    setDownloadFilename("ascii-art.txt")
    setIsDragging(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
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
      const img = new window.Image()
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
        handleImageUpload({ target: { files: dataTransfer.files } } as ChangeEvent<HTMLInputElement>)
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
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      {/* Background decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-purple-500/10 blur-[120px]" />
        <div className="absolute top-[20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-pink-500/10 blur-[120px]" />
        <div className="absolute bottom-[-20%] left-[20%] w-[60%] h-[60%] rounded-full bg-purple-600/10 blur-[120px]" />
        <div className="absolute top-[40%] left-[30%] w-[40%] h-[40%] rounded-full bg-pink-600/10 blur-[120px]" />
      </div>
      
      <div className="relative min-h-screen flex flex-col">
        <header className="border-b border-gray-800/10 p-4 min-h-[72px] flex items-center backdrop-blur-sm bg-black/40 sticky top-0 z-50">
          <div className="container mx-auto flex justify-between items-center">
            <button
              onClick={resetState}
              className="relative text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-purple-400 bg-clip-text text-transparent animate-gradient hover:scale-105 transition-all duration-300 hover:opacity-80 active:scale-95 overflow-hidden group px-4 py-2 rounded-xl border border-transparent hover:border-purple-500/20 cursor-pointer [background-size:200%_auto]"
            >
              <span className="relative z-10 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-purple-400">vibescii</span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-pink-500/30 to-purple-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-out rounded-xl" />
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-pink-500/30 to-purple-500/0 translate-x-[100%] group-hover:translate-x-[-100%] transition-transform duration-1000 ease-out rounded-xl" />
            </button>
            <Sheet onOpenChange={(open) => {
              if (open) setHasOpenedSettings(true)
            }}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="hover:bg-purple-500/10 relative group">
                  <div className="relative">
                    <Settings className="h-5 w-5 transition-all duration-500 group-hover:rotate-180 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-purple-500/30 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>
                  {!hasOpenedSettings && (
                    <>
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-purple-500 rounded-full animate-ping" />
                    </>
                  )}
                  <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-xs text-gray-300 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap border border-gray-800">
                    Customize chars
                  </div>
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

        <main className="container mx-auto p-4 pb-24 flex-1 relative z-10">
          <div className="rounded-2xl backdrop-blur-xl bg-black/50 p-6 border border-gray-800/20">
            <Tabs defaultValue="image" className="w-full" onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 mb-8 gap-2 bg-transparent relative p-1 rounded-xl">
                <div 
                  className="absolute inset-0 flex transition-all duration-500 ease-out" 
                  style={{ 
                    width: 'calc(50% - 0.5rem)', 
                    transform: `translateX(${activeTab === 'image' ? '0' : 'calc(100% + 0.5rem)'})`,
                    margin: '0.125rem',
                    height: 'calc(100% - 0.125rem)'
                  }}
                >
                  <div className="w-full h-full bg-gradient-to-r from-purple-500/40 via-pink-500/40 to-purple-500/40 rounded-lg" />
                </div>
                <TabsTrigger 
                  value="image" 
                  className="flex items-center justify-center gap-2 relative z-10 transition-all duration-300 cursor-pointer rounded-lg py-2 px-6 data-[state=active]:text-white data-[state=active]:font-medium group hover:text-white/80 bg-transparent"
                >
                  <div className="relative">
                    <ImageIcon className="h-4 w-4 transition-transform duration-300 group-data-[state=active]:scale-110" />
                    <div className="absolute inset-0 bg-purple-500/30 rounded-full blur-sm opacity-0 group-data-[state=active]:opacity-100 transition-opacity duration-300" />
                  </div>
                  <span className="relative">
                    Image to ASCII
                    <div className="absolute -bottom-2 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-400 to-pink-400 transition-all duration-300 group-data-[state=active]:w-full" />
                  </span>
                </TabsTrigger>
                <TabsTrigger 
                  value="text" 
                  className="flex items-center justify-center gap-2 relative z-10 transition-all duration-300 cursor-pointer rounded-lg py-2 px-6 data-[state=active]:text-white data-[state=active]:font-medium group hover:text-white/80 bg-transparent"
                >
                  <div className="relative">
                    <Type className="h-4 w-4 transition-transform duration-300 group-data-[state=active]:scale-110" />
                    <div className="absolute inset-0 bg-purple-500/30 rounded-full blur-sm opacity-0 group-data-[state=active]:opacity-100 transition-opacity duration-300" />
                  </div>
                  <span className="relative">
                    Text to ASCII
                    <div className="absolute -bottom-2 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-400 to-pink-400 transition-all duration-300 group-data-[state=active]:w-full" />
                  </span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="image" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="min-h-[32px] flex items-center">
                        <Label>Upload Image</Label>
                      </div>
                      <div
                        className={cn(
                          "flex flex-col items-center justify-center border-2 border-dashed rounded-lg h-64 cursor-pointer hover:bg-gray-900/30 transition-colors backdrop-blur-sm",
                          isDragging ? "border-purple-500 bg-purple-500/10" : "border-gray-700",
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
                      <div className="relative w-full h-48">
                        <Image
                          src={imagePreview}
                          alt="Preview"
                          width={400}
                          height={300}
                          className="object-contain"
                          priority
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center min-h-[32px]">
                      <Label htmlFor="output-ascii-image">ASCII Output</Label>
                      <div className="space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={handleCopy} 
                          disabled={!asciiOutput}
                          className="bg-gray-900/50 backdrop-blur-sm border border-gray-800/20 hover:bg-purple-500/20 hover:border-purple-500/30 transition-all duration-300 group"
                        >
                          <Copy className="h-4 w-4 mr-2 transition-transform duration-300 group-hover:scale-110" />
                          Copy
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={handleDownload} 
                          disabled={!asciiOutput}
                          className="bg-gray-900/50 backdrop-blur-sm border border-gray-800/20 hover:bg-purple-500/20 hover:border-purple-500/30 transition-all duration-300 group"
                        >
                          <Download className="h-4 w-4 mr-2 transition-transform duration-300 group-hover:scale-110" />
                          Download
                        </Button>
                      </div>
                    </div>
                    <Textarea
                      id="output-ascii-image"
                      readOnly
                      className="h-64 font-mono text-xs bg-gray-900/70 backdrop-blur-sm border-gray-800/30"
                      value={asciiOutput}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="text" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 items-start">
                  <div className="space-y-2 min-h-[32px]">
                    <div className="min-h-[32px] flex items-center">
                      <Label htmlFor="input-text">Input Text</Label>
                    </div>
                    <Textarea
                      id="input-text"
                      placeholder="Type something here..."
                      className="h-64 font-mono text-xs leading-[1.2] bg-gray-900/70 backdrop-blur-sm border-gray-800/30 focus:border-purple-500/50 transition-colors"
                      value={text}
                      onChange={handleTextChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center min-h-[32px]">
                      <Label htmlFor="output-ascii">ASCII Output</Label>
                      <div className="space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={handleCopy} 
                          disabled={!asciiOutput}
                          className="bg-gray-900/50 backdrop-blur-sm border border-gray-800/20 hover:bg-purple-500/20 hover:border-purple-500/30 transition-all duration-300 group"
                        >
                          <Copy className="h-4 w-4 mr-2 transition-transform duration-300 group-hover:scale-110" />
                          Copy
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={handleDownload} 
                          disabled={!asciiOutput}
                          className="bg-gray-900/50 backdrop-blur-sm border border-gray-800/20 hover:bg-purple-500/20 hover:border-purple-500/30 transition-all duration-300 group"
                        >
                          <Download className="h-4 w-4 mr-2 transition-transform duration-300 group-hover:scale-110" />
                          Download
                        </Button>
                      </div>
                    </div>
                    <Textarea
                      id="output-ascii"
                      readOnly
                      className="h-64 font-mono text-xs leading-[1.2] bg-gray-900/70 backdrop-blur-sm border-gray-800/30"
                      value={asciiOutput}
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>

        <footer className="container mx-auto p-4 pb-8 text-center">
          <div className="text-gray-500 text-sm">
            Made with ♥️ by vibescii
          </div>
        </footer>

        <Toaster />
      </div>

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
    </div>
  )
}

