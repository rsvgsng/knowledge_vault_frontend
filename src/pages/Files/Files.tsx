"use client"

import { useState } from "react"
import { Plus, Trash, Edit, FileText, ChevronDown, ChevronRight, Save } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Define types based on the class diagram
interface FILE {
    id: number
    shortName: string
    longName: string
    fileLocation: string
    fileSize: number
    docLink: string
    archive: boolean
}

interface FILE_Field {
    id: number
    fileId: number
    fieldName: string
    description: string
    fieldSize: number
    packed: boolean
    begPosition: number
    endPosition: number
    validDataNotes: string
    archive: boolean
}

interface FILE_Field_ValidData {
    fileFieldID: number
    seqID: number
    validData: string
    validDataDesc: string
    archive: boolean
}

interface FILE_DataStructure {
    fileFieldID: number
    dsID: number
    dsBegPosition: number
    dsEndPosition: number
    dsName: string
    dsDesc: string
    archive: boolean
}

function Files() {
    // State for files, fields, and valid data
    const [files, setFiles] = useState<FILE[]>([])
    const [fields, setFields] = useState<FILE_Field[]>([])
    const [validData, setValidData] = useState<FILE_Field_ValidData[]>([])
    const [dataStructures, setDataStructures] = useState<FILE_DataStructure[]>([])

    // State for dialog
    const [showCreateFileDialog, setShowCreateFileDialog] = useState(false)
    const [activeTab, setActiveTab] = useState("file")
    const [selectedFile, setSelectedFile] = useState<FILE | null>(null)
    const [selectedField, setSelectedField] = useState<FILE_Field | null>(null)
    const [expandedFields, setExpandedFields] = useState<number[]>([])

    // State for new file creation
    const [newFile, setNewFile] = useState<Omit<FILE, "id">>({
        shortName: "",
        longName: "",
        fileLocation: "",
        fileSize: 0,
        docLink: "",
        archive: false,
    })

    // State for new field creation
    const [newField, setNewField] = useState<Omit<FILE_Field, "id" | "fileId">>({
        fieldName: "",
        description: "",
        fieldSize: 0,
        packed: false,
        begPosition: 0,
        endPosition: 0,
        validDataNotes: "",
        archive: false,
    })

    // State for new valid data creation
    const [newValidData, setNewValidData] = useState<Omit<FILE_Field_ValidData, "fileFieldID">>({
        seqID: 1,
        validData: "",
        validDataDesc: "",
        archive: false,
    })

    // State for new data structure creation
    const [newDataStructure, setNewDataStructure] = useState<Omit<FILE_DataStructure, "fileFieldID">>({
        dsID: 1,
        dsBegPosition: 0,
        dsEndPosition: 0,
        dsName: "",
        dsDesc: "",
        archive: false,
    })

    // State for edit mode
    const [isEditMode, setIsEditMode] = useState(false)

    // Handle file selection
    const handleSelectFile = (file: FILE) => {
        setSelectedFile(file)
        setSelectedField(null)

        // Filter fields for this file
        const fileFields = fields.filter((field) => field.fileId === file.id)
        if (fileFields.length > 0) {
            setExpandedFields([...expandedFields, file.id])
        }
    }

    // Handle field selection
    const handleSelectField = (field: FILE_Field) => {
        setSelectedField(field)
    }

    // Toggle field expansion
    const toggleFieldExpansion = (fileId: number) => {
        if (expandedFields.includes(fileId)) {
            setExpandedFields(expandedFields.filter((id) => id !== fileId))
        } else {
            setExpandedFields([...expandedFields, fileId])
        }
    }

    // Create new file
    const handleCreateFile = () => {
        const newId = files.length > 0 ? Math.max(...files.map((file) => file.id)) + 1 : 1
        const fileToAdd: FILE = {
            id: newId,
            ...newFile,
        }

        setFiles([...files, fileToAdd])
        setShowCreateFileDialog(false)
        setNewFile({
            shortName: "",
            longName: "",
            fileLocation: "",
            fileSize: 0,
            docLink: "",
            archive: false,
        })
        setActiveTab("file")
    }

    // Add field to selected file
    const handleAddField = () => {
        if (!selectedFile) return

        // Calculate positions based on existing fields
        const fileFields = fields.filter((field) => field.fileId === selectedFile.id)
        let begPos = 1
        let endPos = 1

        if (fileFields.length > 0) {
            const lastField = fileFields.reduce((prev, current) => (prev.endPosition > current.endPosition ? prev : current))
            begPos = lastField.endPosition + 1
            endPos = begPos + (newField.fieldSize > 0 ? newField.fieldSize - 1 : 0)
        }

        const fieldToAdd: FILE_Field = {
            id: fields.length > 0 ? Math.max(...fields.map((field) => field.id)) + 1 : 1,
            fileId: selectedFile.id,
            ...newField,
            begPosition: begPos,
            endPosition: endPos,
        }

        setFields([...fields, fieldToAdd])
        setNewField({
            fieldName: "",
            description: "",
            fieldSize: 0,
            packed: false,
            begPosition: 0,
            endPosition: 0,
            validDataNotes: "",
            archive: false,
        })
    }

    // Add valid data to selected field
    const handleAddValidData = () => {
        if (!selectedField) return

        // Get the next sequence ID
        const fieldValidData = validData.filter((vd) => vd.fileFieldID === selectedField.id)
        const nextSeqId = fieldValidData.length > 0 ? Math.max(...fieldValidData.map((vd) => vd.seqID)) + 1 : 1

        const validDataToAdd: FILE_Field_ValidData = {
            fileFieldID: selectedField.id,
            ...newValidData,
            seqID: nextSeqId,
        }

        setValidData([...validData, validDataToAdd])
        setNewValidData({
            seqID: nextSeqId + 1,
            validData: "",
            validDataDesc: "",
            archive: false,
        })
    }

    // Delete a file
    const handleDeleteFile = (fileId: number) => {
        // Delete file
        setFiles(files.filter((file) => file.id !== fileId))

        // Delete associated fields
        const fieldsToDelete = fields.filter((field) => field.fileId === fileId)
        setFields(fields.filter((field) => field.fileId !== fileId))

        // Delete associated valid data
        const fieldIds = fieldsToDelete.map((field) => field.id)
        setValidData(validData.filter((vd) => !fieldIds.includes(vd.fileFieldID)))

        // Delete associated data structures
        setDataStructures(dataStructures.filter((ds) => !fieldIds.includes(ds.fileFieldID)))

        // Reset selection if needed
        if (selectedFile && selectedFile.id === fileId) {
            setSelectedFile(null)
            setSelectedField(null)
        }
    }

    // Delete a field
    const handleDeleteField = (fieldId: number) => {
        // Delete field
        setFields(fields.filter((field) => field.id !== fieldId))

        // Delete associated valid data
        setValidData(validData.filter((vd) => vd.fileFieldID !== fieldId))

        // Delete associated data structures
        setDataStructures(dataStructures.filter((ds) => ds.fileFieldID !== fieldId))

        // Reset selection if needed
        if (selectedField && selectedField.id === fieldId) {
            setSelectedField(null)
        }
    }

    // Delete valid data
    const handleDeleteValidData = (fieldId: number, seqId: number) => {
        setValidData(validData.filter((vd) => !(vd.fileFieldID === fieldId && vd.seqID === seqId)))
    }

    // Update field positions when field size changes
    const updateFieldPositions = (fileId: number) => {
        const fileFields = fields.filter((field) => field.fileId === fileId)

        // Sort fields by beginning position
        const sortedFields = [...fileFields].sort((a, b) => a.begPosition - b.begPosition)

        // Recalculate positions
        let currentPos = 1
        const updatedFields = sortedFields.map((field) => {
            const updatedField = { ...field, begPosition: currentPos }
            currentPos += field.fieldSize
            updatedField.endPosition = currentPos - 1
            return updatedField
        })

        // Update fields
        setFields(
            fields.map((field) => {
                const updatedField = updatedFields.find((uf) => uf.id === field.id)
                return updatedField || field
            }),
        )
    }

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">File Management System</h1>
                <Button onClick={() => setShowCreateFileDialog(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Create New File
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* File Explorer */}
                <div className="md:col-span-1 border rounded-md p-4">
                    <h2 className="text-lg font-semibold mb-4">Files</h2>

                    {files.length === 0 ? (
                        <div className="text-center p-4 text-muted-foreground">
                            <FileText className="mx-auto h-8 w-8 mb-2" />
                            <p>No files created yet</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {files.map((file) => (
                                <div key={file.id} className="space-y-1">
                                    <div
                                        className={`flex items-center p-2 rounded-md cursor-pointer ${selectedFile?.id === file.id ? "bg-muted" : "hover:bg-muted/50"
                                            }`}
                                        onClick={() => handleSelectFile(file)}
                                    >
                                        <button
                                            className="mr-1"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                toggleFieldExpansion(file.id)
                                            }}
                                        >
                                            {expandedFields.includes(file.id) ? (
                                                <ChevronDown className="h-4 w-4" />
                                            ) : (
                                                <ChevronRight className="h-4 w-4" />
                                            )}
                                        </button>
                                        <span className="flex-1 truncate">{file.shortName}</span>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handleDeleteFile(file.id)
                                            }}
                                        >
                                            <Trash className="h-4 w-4" />
                                        </Button>
                                    </div>

                                    {expandedFields.includes(file.id) && (
                                        <div className="ml-6 space-y-1 border-l pl-2">
                                            {fields
                                                .filter((field) => field.fileId === file.id)
                                                .map((field) => (
                                                    <div
                                                        key={field.id}
                                                        className={`flex items-center p-1 rounded-md cursor-pointer ${selectedField?.id === field.id ? "bg-muted" : "hover:bg-muted/50"
                                                            }`}
                                                        onClick={() => handleSelectField(field)}
                                                    >
                                                        <span className="flex-1 truncate text-sm">{field.fieldName}</span>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                handleDeleteField(field.id)
                                                            }}
                                                        >
                                                            <Trash className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                ))}

                                            {selectedFile?.id === file.id && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="w-full justify-start text-xs"
                                                    onClick={handleAddField}
                                                >
                                                    <Plus className="h-3 w-3 mr-1" /> Add Field
                                                </Button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Details Panel */}
                <div className="md:col-span-3 border rounded-md p-4">
                    {selectedFile ? (
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-semibold">
                                    {selectedFile.shortName} ({selectedFile.longName})
                                </h2>
                                <div className="flex space-x-2">
                                    <Button variant="outline" size="sm" onClick={() => setIsEditMode(!isEditMode)}>
                                        <Edit className="h-4 w-4 mr-1" /> {isEditMode ? "Cancel" : "Edit"}
                                    </Button>
                                    {isEditMode && (
                                        <Button size="sm">
                                            <Save className="h-4 w-4 mr-1" /> Save
                                        </Button>
                                    )}
                                </div>
                            </div>

                            <Tabs defaultValue="details">
                                <TabsList>
                                    <TabsTrigger value="details">File Details</TabsTrigger>
                                    <TabsTrigger value="fields">Fields</TabsTrigger>
                                    {selectedField && <TabsTrigger value="validData">Valid Data</TabsTrigger>}
                                </TabsList>

                                <TabsContent value="details" className="space-y-4 pt-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>Short Name</Label>
                                            {isEditMode ? (
                                                <Input
                                                    value={selectedFile.shortName}
                                                    onChange={(e) => setSelectedFile({ ...selectedFile, shortName: e.target.value })}
                                                />
                                            ) : (
                                                <div className="p-2 border rounded-md">{selectedFile.shortName}</div>
                                            )}
                                        </div>
                                        <div>
                                            <Label>Long Name</Label>
                                            {isEditMode ? (
                                                <Input
                                                    value={selectedFile.longName}
                                                    onChange={(e) => setSelectedFile({ ...selectedFile, longName: e.target.value })}
                                                />
                                            ) : (
                                                <div className="p-2 border rounded-md">{selectedFile.longName}</div>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <Label>File Location</Label>
                                        {isEditMode ? (
                                            <Input
                                                value={selectedFile.fileLocation}
                                                onChange={(e) => setSelectedFile({ ...selectedFile, fileLocation: e.target.value })}
                                            />
                                        ) : (
                                            <div className="p-2 border rounded-md">{selectedFile.fileLocation}</div>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>File Size</Label>
                                            {isEditMode ? (
                                                <Input
                                                    type="number"
                                                    value={selectedFile.fileSize}
                                                    onChange={(e) =>
                                                        setSelectedFile({ ...selectedFile, fileSize: Number.parseInt(e.target.value) || 0 })
                                                    }
                                                />
                                            ) : (
                                                <div className="p-2 border rounded-md">{selectedFile.fileSize}</div>
                                            )}
                                        </div>
                                        <div>
                                            <Label>Document Link</Label>
                                            {isEditMode ? (
                                                <Input
                                                    value={selectedFile.docLink}
                                                    onChange={(e) => setSelectedFile({ ...selectedFile, docLink: e.target.value })}
                                                />
                                            ) : (
                                                <div className="p-2 border rounded-md">{selectedFile.docLink}</div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        {isEditMode ? (
                                            <>
                                                <Checkbox
                                                    id="archive"
                                                    checked={selectedFile.archive}
                                                    onCheckedChange={(checked) => setSelectedFile({ ...selectedFile, archive: checked === true })}
                                                />
                                                <Label htmlFor="archive">Archive</Label>
                                            </>
                                        ) : (
                                            <div className="p-2 border rounded-md">Archive: {selectedFile.archive ? "Yes" : "No"}</div>
                                        )}
                                    </div>
                                </TabsContent>

                                <TabsContent value="fields" className="pt-4">
                                    {fields.filter((field) => field.fileId === selectedFile.id).length > 0 ? (
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Field Name</TableHead>
                                                    <TableHead>Description</TableHead>
                                                    <TableHead>Size</TableHead>
                                                    <TableHead>Position</TableHead>
                                                    <TableHead>Packed</TableHead>
                                                    <TableHead>Archive</TableHead>
                                                    <TableHead></TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {fields
                                                    .filter((field) => field.fileId === selectedFile.id)
                                                    .map((field) => (
                                                        <TableRow
                                                            key={field.id}
                                                            className={selectedField?.id === field.id ? "bg-muted" : ""}
                                                            onClick={() => handleSelectField(field)}
                                                        >
                                                            <TableCell>{field.fieldName}</TableCell>
                                                            <TableCell>{field.description}</TableCell>
                                                            <TableCell>{field.fieldSize}</TableCell>
                                                            <TableCell>
                                                                {field.begPosition}-{field.endPosition}
                                                            </TableCell>
                                                            <TableCell>{field.packed ? "Yes" : "No"}</TableCell>
                                                            <TableCell>{field.archive ? "Yes" : "No"}</TableCell>
                                                            <TableCell>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation()
                                                                        handleDeleteField(field.id)
                                                                    }}
                                                                >
                                                                    <Trash className="h-4 w-4" />
                                                                </Button>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                            </TableBody>
                                        </Table>
                                    ) : (
                                        <div className="text-center p-4 text-muted-foreground">
                                            <p>No fields added to this file yet</p>
                                        </div>
                                    )}

                                    <div className="mt-4 space-y-4 border-t pt-4">
                                        <h3 className="font-medium">Add New Field</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="fieldName">Field Name</Label>
                                                <Input
                                                    id="fieldName"
                                                    value={newField.fieldName}
                                                    onChange={(e) => setNewField({ ...newField, fieldName: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="fieldSize">Field Size</Label>
                                                <Input
                                                    id="fieldSize"
                                                    type="number"
                                                    value={newField.fieldSize}
                                                    onChange={(e) =>
                                                        setNewField({ ...newField, fieldSize: Number.parseInt(e.target.value) || 0 })
                                                    }
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <Label htmlFor="description">Description</Label>
                                            <Textarea
                                                id="description"
                                                value={newField.description}
                                                onChange={(e) => setNewField({ ...newField, description: e.target.value })}
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="validDataNotes">Valid Data Notes</Label>
                                            <Textarea
                                                id="validDataNotes"
                                                value={newField.validDataNotes}
                                                onChange={(e) => setNewField({ ...newField, validDataNotes: e.target.value })}
                                            />
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="packed"
                                                checked={newField.packed}
                                                onCheckedChange={(checked) => setNewField({ ...newField, packed: checked === true })}
                                            />
                                            <Label htmlFor="packed">Packed</Label>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="fieldArchive"
                                                checked={newField.archive}
                                                onCheckedChange={(checked) => setNewField({ ...newField, archive: checked === true })}
                                            />
                                            <Label htmlFor="fieldArchive">Archive</Label>
                                        </div>

                                        <Button onClick={handleAddField}>
                                            <Plus className="mr-2 h-4 w-4" /> Add Field
                                        </Button>
                                    </div>
                                </TabsContent>

                                {selectedField && (
                                    <TabsContent value="validData" className="pt-4">
                                        <h3 className="font-medium mb-4">Valid Data for Field: {selectedField.fieldName}</h3>

                                        {validData.filter((vd) => vd.fileFieldID === selectedField.id).length > 0 ? (
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Seq ID</TableHead>
                                                        <TableHead>Valid Data</TableHead>
                                                        <TableHead>Description</TableHead>
                                                        <TableHead>Archive</TableHead>
                                                        <TableHead></TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {validData
                                                        .filter((vd) => vd.fileFieldID === selectedField.id)
                                                        .map((vd) => (
                                                            <TableRow key={`${vd.fileFieldID}-${vd.seqID}`}>
                                                                <TableCell>{vd.seqID}</TableCell>
                                                                <TableCell>{vd.validData}</TableCell>
                                                                <TableCell>{vd.validDataDesc}</TableCell>
                                                                <TableCell>{vd.archive ? "Yes" : "No"}</TableCell>
                                                                <TableCell>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        onClick={() => handleDeleteValidData(vd.fileFieldID, vd.seqID)}
                                                                    >
                                                                        <Trash className="h-4 w-4" />
                                                                    </Button>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                </TableBody>
                                            </Table>
                                        ) : (
                                            <div className="text-center p-4 text-muted-foreground">
                                                <p>No valid data added to this field yet</p>
                                            </div>
                                        )}

                                        <div className="mt-4 space-y-4 border-t pt-4">
                                            <h3 className="font-medium">Add New Valid Data</h3>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <Label htmlFor="validData">Valid Data</Label>
                                                    <Input
                                                        id="validData"
                                                        value={newValidData.validData}
                                                        onChange={(e) => setNewValidData({ ...newValidData, validData: e.target.value })}
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor="validDataDesc">Description</Label>
                                                    <Input
                                                        id="validDataDesc"
                                                        value={newValidData.validDataDesc}
                                                        onChange={(e) => setNewValidData({ ...newValidData, validDataDesc: e.target.value })}
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="validDataArchive"
                                                    checked={newValidData.archive}
                                                    onCheckedChange={(checked) => setNewValidData({ ...newValidData, archive: checked === true })}
                                                />
                                                <Label htmlFor="validDataArchive">Archive</Label>
                                            </div>

                                            <Button onClick={handleAddValidData}>
                                                <Plus className="mr-2 h-4 w-4" /> Add Valid Data
                                            </Button>
                                        </div>
                                    </TabsContent>
                                )}
                            </Tabs>
                        </div>
                    ) : (
                        <div className="text-center p-8">
                            <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                            <h2 className="text-lg font-medium mb-2">No file selected</h2>
                            <p className="text-muted-foreground mb-4">Select a file from the list or create a new one</p>
                            <Button onClick={() => setShowCreateFileDialog(true)}>
                                <Plus className="mr-2 h-4 w-4" /> Create New File
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Create File Dialog */}
            <Dialog open={showCreateFileDialog} onOpenChange={setShowCreateFileDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create a new file</DialogTitle>
                        <DialogDescription>
                            Add a new file to the system. You can add fields after creating the file.
                        </DialogDescription>
                    </DialogHeader>

                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="grid w-full grid-cols-1">
                            <TabsTrigger value="file">File Details</TabsTrigger>
                        </TabsList>

                        <TabsContent value="file" className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="shortName">Short Name</Label>
                                    <Input
                                        id="shortName"
                                        value={newFile.shortName}
                                        onChange={(e) => setNewFile((prev) => ({ ...prev, shortName: e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="longName">Long Name</Label>
                                    <Input
                                        id="longName"
                                        value={newFile.longName}
                                        onChange={(e) => setNewFile((prev) => ({ ...prev, longName: e.target.value }))}
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="fileLocation">File Location</Label>
                                <Input
                                    id="fileLocation"
                                    value={newFile.fileLocation}
                                    onChange={(e) => setNewFile((prev) => ({ ...prev, fileLocation: e.target.value }))}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="fileSize">File Size (bytes)</Label>
                                    <Input
                                        id="fileSize"
                                        type="number"
                                        value={newFile.fileSize}
                                        onChange={(e) =>
                                            setNewFile((prev) => ({ ...prev, fileSize: Number.parseInt(e.target.value) || 0 }))
                                        }
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="docLink">Document Link</Label>
                                    <Input
                                        id="docLink"
                                        value={newFile.docLink}
                                        onChange={(e) => setNewFile((prev) => ({ ...prev, docLink: e.target.value }))}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="archive"
                                    checked={newFile.archive}
                                    onCheckedChange={(checked) => setNewFile((prev) => ({ ...prev, archive: checked === true }))}
                                />
                                <Label htmlFor="archive">Archive</Label>
                            </div>
                        </TabsContent>
                    </Tabs>

                    <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setShowCreateFileDialog(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleCreateFile}>Create File</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default Files
