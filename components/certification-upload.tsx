"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Upload, X, FileText, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { Progress } from "@/components/ui/progress"

interface CertificationUploadProps {
  certificationTypes: string[]
  onUploadComplete: (files: File[], certificationType: string) => void
}

export function CertificationUpload({ certificationTypes, onUploadComplete }: CertificationUploadProps) {
  const [files, setFiles] = useState<File[]>([])
  const [certificationType, setCertificationType] = useState<string>("")
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files)
      setFiles([...files, ...newFiles])
      setError(null)
    }
  }

  const removeFile = (index: number) => {
    const newFiles = [...files]
    newFiles.splice(index, 1)
    setFiles(newFiles)
  }

  const handleSubmit = async () => {
    if (files.length === 0) {
      setError("Por favor, sube al menos un archivo")
      return
    }

    if (!certificationType) {
      setError("Por favor, selecciona un tipo de certificación")
      return
    }

    setUploading(true)
    setProgress(0)
    setError(null)

    // Simulación de carga
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 10
      })
    }, 300)

    // Simulación de carga completa
    setTimeout(() => {
      clearInterval(interval)
      setProgress(100)
      setUploading(false)
      setSuccess(true)
      onUploadComplete(files, certificationType)
    }, 3000)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subir Certificación Profesional</CardTitle>
        <CardDescription>
          Sube los documentos que acrediten tu certificación profesional para verificar tu perfil
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {success ? (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle>Documentos subidos correctamente</AlertTitle>
            <AlertDescription>
              Tus documentos han sido enviados para verificación. Te notificaremos cuando sean aprobados.
            </AlertDescription>
          </Alert>
        ) : (
          <>
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="certification-type">Tipo de certificación</Label>
              <select
                id="certification-type"
                className="w-full p-2 border rounded-md"
                value={certificationType}
                onChange={(e) => setCertificationType(e.target.value)}
                disabled={uploading}
              >
                <option value="">Seleccionar tipo de certificación</option>
                {certificationTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="file-upload">Documentos de certificación</Label>
              <div className="border-2 border-dashed rounded-md p-6 text-center">
                <Input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png"
                  disabled={uploading}
                />
                <Label htmlFor="file-upload" className="cursor-pointer">
                  <div className="flex flex-col items-center">
                    <Upload className="h-10 w-10 text-gray-400 mb-2" />
                    <p className="text-sm font-medium">Arrastra archivos aquí o haz clic para seleccionar</p>
                    <p className="text-xs text-gray-500 mt-1">Formatos aceptados: PDF, JPG, PNG (máx. 10MB)</p>
                  </div>
                </Label>
              </div>
            </div>

            {files.length > 0 && (
              <div className="space-y-2">
                <Label>Archivos seleccionados</Label>
                <div className="space-y-2">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded-md">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-blue-500 mr-2" />
                        <div>
                          <p className="text-sm font-medium truncate max-w-[200px]">{file.name}</p>
                          <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => removeFile(index)} disabled={uploading}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {uploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subiendo...</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} />
              </div>
            )}
          </>
        )}
      </CardContent>

      <CardFooter>
        {!success && (
          <Button
            className="w-full"
            onClick={handleSubmit}
            disabled={uploading || files.length === 0 || !certificationType}
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Subiendo...
              </>
            ) : (
              "Subir documentos"
            )}
          </Button>
        )}

        {success && (
          <Button
            variant="outline"
            className="w-full mt-2"
            onClick={() => {
              setFiles([])
              setCertificationType("")
              setSuccess(false)
            }}
          >
            Subir más documentos
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
