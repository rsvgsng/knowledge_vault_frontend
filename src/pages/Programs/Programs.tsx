"use client"

import { useState } from "react"
import { Plus, Trash, Edit, FileCode, ChevronDown, ChevronRight, Save, FileText } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Define types based on the class diagram
interface PROGRAM {
    id: number
    programName: string
    runningLocation: string
    sourceLocation: string
    programType: string
    programDescription: string
    keyProgrammers: string
    keyUsers: string
    archive: boolean
}

interface PROGRAM_KeyFile {
    programID: number
    seqID: number
    fileID: number
    programFileNotes: string
    lastUpdateDT: string
    creationDateTime: string
    archive: boolean
    fileName?: string // For display purposes
}

interface PROGRAM_Notes {
    programID: number
    seqID: number
    programNotes: string
    userID: string
    creationDateTime: string
    lastUpdateDT: string
    archive: boolean
}

// Mock file data for selection
interface FILE {
    id: number
    shortName: string
}

function Programs() {
    // Mock files for selection
    const [files, setFiles] = useState<FILE[]>([
        { id: 1, shortName: "CustomerData.dat" },
        { id: 2, shortName: "TransactionLog.dat" },
        { id: 3, shortName: "UserProfiles.dat" },
        { id: 4, shortName: "SystemConfig.xml" },
        { id: 5, shortName: "ErrorLog.txt" },
    ])

    // State for programs, key files, and notes
    const [programs, setPrograms] = useState<PROGRAM[]>([])
    const [keyFiles, setKeyFiles] = useState<PROGRAM_KeyFile[]>([])
    const [notes, setNotes] = useState<PROGRAM_Notes[]>([])

    // State for dialog
    const [showCreateProgramDialog, setShowCreateProgramDialog] = useState(false)
    const [activeTab, setActiveTab] = useState("program")
    const [selectedProgram, setSelectedProgram] = useState<PROGRAM | null>(null)
    const [expandedPrograms, setExpandedPrograms] = useState<number[]>([])
    const [selectedSection, setSelectedSection] = useState<"keyFiles" | "notes" | null>(null)

    // State for new program creation
    const [newProgram, setNewProgram] = useState<Omit<PROGRAM, "id">>({
        programName: "",
        runningLocation: "",
        sourceLocation: "",
        programType: "",
        programDescription: "",
        keyProgrammers: "",
        keyUsers: "",
        archive: false,
    })

    // State for new key file creation
    const [newKeyFile, setNewKeyFile] = useState<
        Omit<PROGRAM_KeyFile, "programID" | "seqID" | "lastUpdateDT" | "creationDateTime">
    >({
        fileID: 0,
        programFileNotes: "",
        archive: false,
    })

    // State for new note creation
    const [newNote, setNewNote] = useState<
        Omit<PROGRAM_Notes, "programID" | "seqID" | "creationDateTime" | "lastUpdateDT">
    >({
        programNotes: "",
        userID: "",
        archive: false,
    })

    // State for edit mode
    const [isEditMode, setIsEditMode] = useState(false)

    // Handle program selection
    const handleSelectProgram = (program: PROGRAM) => {
        setSelectedProgram(program)
        setSelectedSection(null)

        // Expand the program in the sidebar
        if (!expandedPrograms.includes(program.id)) {
            setExpandedPrograms([...expandedPrograms, program.id])
        }
    }

    // Toggle program expansion in sidebar
    const toggleProgramExpansion = (programId: number) => {
        if (expandedPrograms.includes(programId)) {
            setExpandedPrograms(expandedPrograms.filter((id) => id !== programId))
        } else {
            setExpandedPrograms([...expandedPrograms, programId])
        }
    }

    // Create new program
    const handleCreateProgram = () => {
        const newId = programs.length > 0 ? Math.max(...programs.map((program) => program.id)) + 1 : 1
        const programToAdd: PROGRAM = {
            id: newId,
            ...newProgram,
        }

        setPrograms([...programs, programToAdd])
        setShowCreateProgramDialog(false)
        setNewProgram({
            programName: "",
            runningLocation: "",
            sourceLocation: "",
            programType: "",
            programDescription: "",
            keyProgrammers: "",
            keyUsers: "",
            archive: false,
        })
        setActiveTab("program")
    }

    // Add key file to selected program
    const handleAddKeyFile = () => {
        if (!selectedProgram) return

        // Get the next sequence ID
        const programKeyFiles = keyFiles.filter((kf) => kf.programID === selectedProgram.id)
        const nextSeqId = programKeyFiles.length > 0 ? Math.max(...programKeyFiles.map((kf) => kf.seqID)) + 1 : 1

        // Get the file name for display
        const selectedFile = files.find((file) => file.id === newKeyFile.fileID)

        const keyFileToAdd: PROGRAM_KeyFile = {
            programID: selectedProgram.id,
            seqID: nextSeqId,
            fileID: newKeyFile.fileID,
            programFileNotes: newKeyFile.programFileNotes,
            lastUpdateDT: new Date().toISOString(),
            creationDateTime: new Date().toISOString(),
            archive: newKeyFile.archive,
            fileName: selectedFile?.shortName,
        }

        setKeyFiles([...keyFiles, keyFileToAdd])
        setNewKeyFile({
            fileID: 0,
            programFileNotes: "",
            archive: false,
        })
    }

    // Add note to selected program
    const handleAddNote = () => {
        if (!selectedProgram) return

        // Get the next sequence ID
        const programNotes = notes.filter((note) => note.programID === selectedProgram.id)
        const nextSeqId = programNotes.length > 0 ? Math.max(...programNotes.map((note) => note.seqID)) + 1 : 1

        const noteToAdd: PROGRAM_Notes = {
            programID: selectedProgram.id,
            seqID: nextSeqId,
            programNotes: newNote.programNotes,
            userID: newNote.userID,
            creationDateTime: new Date().toISOString(),
            lastUpdateDT: new Date().toISOString(),
            archive: newNote.archive,
        }

        setNotes([...notes, noteToAdd])
        setNewNote({
            programNotes: "",
            userID: "",
            archive: false,
        })
    }

    // Delete a program
    const handleDeleteProgram = (programId: number) => {
        // Delete program
        setPrograms(programs.filter((program) => program.id !== programId))

        // Delete associated key files and notes
        setKeyFiles(keyFiles.filter((kf) => kf.programID !== programId))
        setNotes(notes.filter((note) => note.programID !== programId))

        // Reset selection if needed
        if (selectedProgram && selectedProgram.id === programId) {
            setSelectedProgram(null)
            setSelectedSection(null)
        }
    }

    // Delete a key file
    const handleDeleteKeyFile = (programId: number, seqId: number) => {
        setKeyFiles(keyFiles.filter((kf) => !(kf.programID === programId && kf.seqID === seqId)))
    }

    // Delete a note
    const handleDeleteNote = (programId: number, seqId: number) => {
        setNotes(notes.filter((note) => !(note.programID === programId && note.seqID === seqId)))
    }

    // Format comma-separated values for display
    const formatCommaSeparated = (value: string) => {
        return value.split(",").map((item, index) => (
            <Badge key={index} variant="outline" className="mr-1 mb-1">
                {item.trim()}
            </Badge>
        ))
    }

    // Handle adding a programmer or user
    const handleAddPerson = (type: "programmer" | "user", value: string) => {
        if (!selectedProgram || !value.trim()) return

        const field = type === "programmer" ? "keyProgrammers" : "keyUsers"
        const currentValues = selectedProgram[field]
            .split(",")
            .filter(Boolean)
            .map((v) => v.trim())

        // Don't add duplicates
        if (!currentValues.includes(value.trim())) {
            const newValues = [...currentValues, value.trim()].join(", ")
            setSelectedProgram({
                ...selectedProgram,
                [field]: newValues,
            })
        }
    }

    // Handle removing a programmer or user
    const handleRemovePerson = (type: "programmer" | "user", valueToRemove: string) => {
        if (!selectedProgram) return

        const field = type === "programmer" ? "keyProgrammers" : "keyUsers"
        const currentValues = selectedProgram[field]
            .split(",")
            .filter(Boolean)
            .map((v) => v.trim())
        const newValues = currentValues.filter((v) => v !== valueToRemove.trim()).join(", ")

        setSelectedProgram({
            ...selectedProgram,
            [field]: newValues,
        })
    }

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Program Management System</h1>
                <Button onClick={() => setShowCreateProgramDialog(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Create New Program
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Program Explorer */}
                <div className="md:col-span-1 border rounded-md p-4">
                    <h2 className="text-lg font-semibold mb-4">Programs</h2>

                    {programs.length === 0 ? (
                        <div className="text-center p-4 text-muted-foreground">
                            <FileCode className="mx-auto h-8 w-8 mb-2" />
                            <p>No programs created yet</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {programs.map((program) => (
                                <div key={program.id} className="space-y-1">
                                    <div
                                        className={`flex items-center p-2 rounded-md cursor-pointer ${selectedProgram?.id === program.id ? "bg-muted" : "hover:bg-muted/50"
                                            }`}
                                        onClick={() => handleSelectProgram(program)}
                                    >
                                        <button
                                            className="mr-1"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                toggleProgramExpansion(program.id)
                                            }}
                                        >
                                            {expandedPrograms.includes(program.id) ? (
                                                <ChevronDown className="h-4 w-4" />
                                            ) : (
                                                <ChevronRight className="h-4 w-4" />
                                            )}
                                        </button>
                                        <span className="flex-1 truncate">{program.programName}</span>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handleDeleteProgram(program.id)
                                            }}
                                        >
                                            <Trash className="h-4 w-4" />
                                        </Button>
                                    </div>

                                    {expandedPrograms.includes(program.id) && (
                                        <div className="ml-6 space-y-1 border-l pl-2">
                                            <div
                                                className={`flex items-center p-1 rounded-md cursor-pointer ${selectedSection === "keyFiles" && selectedProgram?.id === program.id
                                                    ? "bg-muted"
                                                    : "hover:bg-muted/50"
                                                    }`}
                                                onClick={() => {
                                                    setSelectedProgram(program)
                                                    setSelectedSection("keyFiles")
                                                }}
                                            >
                                                <FileText className="h-3 w-3 mr-2" />
                                                <span className="text-sm">Key Files</span>
                                                <Badge variant="outline" className="ml-2 text-xs">
                                                    {keyFiles.filter((kf) => kf.programID === program.id).length}
                                                </Badge>
                                            </div>

                                            <div
                                                className={`flex items-center p-1 rounded-md cursor-pointer ${selectedSection === "notes" && selectedProgram?.id === program.id
                                                    ? "bg-muted"
                                                    : "hover:bg-muted/50"
                                                    }`}
                                                onClick={() => {
                                                    setSelectedProgram(program)
                                                    setSelectedSection("notes")
                                                }}
                                            >
                                                <FileText className="h-3 w-3 mr-2" />
                                                <span className="text-sm">Notes</span>
                                                <Badge variant="outline" className="ml-2 text-xs">
                                                    {notes.filter((note) => note.programID === program.id).length}
                                                </Badge>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Details Panel */}
                <div className="md:col-span-3 border rounded-md p-4">
                    {selectedProgram ? (
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-semibold">{selectedProgram.programName}</h2>
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

                            <Tabs defaultValue={selectedSection || "details"}>
                                <TabsList>
                                    <TabsTrigger value="details">Program Details</TabsTrigger>
                                    <TabsTrigger value="keyFiles">Key Files</TabsTrigger>
                                    <TabsTrigger value="notes">Notes</TabsTrigger>
                                </TabsList>

                                <TabsContent value="details" className="space-y-4 pt-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>Program Name</Label>
                                            {isEditMode ? (
                                                <Input
                                                    value={selectedProgram.programName}
                                                    onChange={(e) => setSelectedProgram({ ...selectedProgram, programName: e.target.value })}
                                                />
                                            ) : (
                                                <div className="p-2 border rounded-md">{selectedProgram.programName}</div>
                                            )}
                                        </div>
                                        <div>
                                            <Label>Program Type</Label>
                                            {isEditMode ? (
                                                <Input
                                                    value={selectedProgram.programType}
                                                    onChange={(e) => setSelectedProgram({ ...selectedProgram, programType: e.target.value })}
                                                />
                                            ) : (
                                                <div className="p-2 border rounded-md">{selectedProgram.programType}</div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>Running Location</Label>
                                            {isEditMode ? (
                                                <Input
                                                    value={selectedProgram.runningLocation}
                                                    onChange={(e) => setSelectedProgram({ ...selectedProgram, runningLocation: e.target.value })}
                                                />
                                            ) : (
                                                <div className="p-2 border rounded-md">{selectedProgram.runningLocation}</div>
                                            )}
                                        </div>
                                        <div>
                                            <Label>Source Location</Label>
                                            {isEditMode ? (
                                                <Input
                                                    value={selectedProgram.sourceLocation}
                                                    onChange={(e) => setSelectedProgram({ ...selectedProgram, sourceLocation: e.target.value })}
                                                />
                                            ) : (
                                                <div className="p-2 border rounded-md">{selectedProgram.sourceLocation}</div>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <Label>Program Description</Label>
                                        {isEditMode ? (
                                            <Textarea
                                                value={selectedProgram.programDescription}
                                                onChange={(e) => setSelectedProgram({ ...selectedProgram, programDescription: e.target.value })}
                                            />
                                        ) : (
                                            <div className="p-2 border rounded-md min-h-[80px]">{selectedProgram.programDescription}</div>
                                        )}
                                    </div>

                                    <div>
                                        <Label>Key Programmers</Label>
                                        {isEditMode ? (
                                            <div className="space-y-2">
                                                <div className="flex flex-wrap gap-1 p-2 border rounded-md min-h-[40px]">
                                                    {selectedProgram.keyProgrammers
                                                        .split(",")
                                                        .filter(Boolean)
                                                        .map((programmer, index) => (
                                                            <Badge key={index} variant="secondary" className="flex items-center gap-1">
                                                                {programmer.trim()}
                                                                <button
                                                                    onClick={() => handleRemovePerson("programmer", programmer)}
                                                                    className="ml-1 text-xs hover:text-destructive"
                                                                >
                                                                    ×
                                                                </button>
                                                            </Badge>
                                                        ))}
                                                </div>
                                                <div className="flex gap-2">
                                                    <Input
                                                        placeholder="Add programmer"
                                                        id="newProgrammer"
                                                        onKeyDown={(e) => {
                                                            if (e.key === "Enter") {
                                                                handleAddPerson("programmer", e.currentTarget.value)
                                                                e.currentTarget.value = ""
                                                            }
                                                        }}
                                                    />
                                                    <Button
                                                        size="sm"
                                                        onClick={() => {
                                                            const input = document.getElementById("newProgrammer") as HTMLInputElement
                                                            if (input) {
                                                                handleAddPerson("programmer", input.value)
                                                                input.value = ""
                                                            }
                                                        }}
                                                    >
                                                        Add
                                                    </Button>
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    Press Enter or click Add to add each programmer one at a time
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="p-2 border rounded-md min-h-[40px]">
                                                {selectedProgram.keyProgrammers
                                                    ? formatCommaSeparated(selectedProgram.keyProgrammers)
                                                    : "None specified"}
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <Label>Key Users</Label>
                                        {isEditMode ? (
                                            <div className="space-y-2">
                                                <div className="flex flex-wrap gap-1 p-2 border rounded-md min-h-[40px]">
                                                    {selectedProgram.keyUsers
                                                        .split(",")
                                                        .filter(Boolean)
                                                        .map((user, index) => (
                                                            <Badge key={index} variant="secondary" className="flex items-center gap-1">
                                                                {user.trim()}
                                                                <button
                                                                    onClick={() => handleRemovePerson("user", user)}
                                                                    className="ml-1 text-xs hover:text-destructive"
                                                                >
                                                                    ×
                                                                </button>
                                                            </Badge>
                                                        ))}
                                                </div>
                                                <div className="flex gap-2">
                                                    <Input
                                                        placeholder="Add user"
                                                        id="newUser"
                                                        onKeyDown={(e) => {
                                                            if (e.key === "Enter") {
                                                                handleAddPerson("user", e.currentTarget.value)
                                                                e.currentTarget.value = ""
                                                            }
                                                        }}
                                                    />
                                                    <Button
                                                        size="sm"
                                                        onClick={() => {
                                                            const input = document.getElementById("newUser") as HTMLInputElement
                                                            if (input) {
                                                                handleAddPerson("user", input.value)
                                                                input.value = ""
                                                            }
                                                        }}
                                                    >
                                                        Add
                                                    </Button>
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    Press Enter or click Add to add each user one at a time
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="p-2 border rounded-md min-h-[40px]">
                                                {selectedProgram.keyUsers ? formatCommaSeparated(selectedProgram.keyUsers) : "None specified"}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        {isEditMode ? (
                                            <>
                                                <Checkbox
                                                    id="archive"
                                                    checked={selectedProgram.archive}
                                                    onCheckedChange={(checked) =>
                                                        setSelectedProgram({ ...selectedProgram, archive: checked === true })
                                                    }
                                                />
                                                <Label htmlFor="archive">Archive</Label>
                                            </>
                                        ) : (
                                            <div className="p-2 border rounded-md">Archive: {selectedProgram.archive ? "Yes" : "No"}</div>
                                        )}
                                    </div>
                                </TabsContent>

                                <TabsContent value="keyFiles" className="pt-4">
                                    {keyFiles.filter((kf) => kf.programID === selectedProgram.id).length > 0 ? (
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Seq ID</TableHead>
                                                    <TableHead>File</TableHead>
                                                    <TableHead>Notes</TableHead>
                                                    <TableHead>Created</TableHead>
                                                    <TableHead>Updated</TableHead>
                                                    <TableHead>Archive</TableHead>
                                                    <TableHead></TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {keyFiles
                                                    .filter((kf) => kf.programID === selectedProgram.id)
                                                    .map((kf) => (
                                                        <TableRow key={`${kf.programID}-${kf.seqID}`}>
                                                            <TableCell>{kf.seqID}</TableCell>
                                                            <TableCell>{kf.fileName || `File ID: ${kf.fileID}`}</TableCell>
                                                            <TableCell className="max-w-[200px] truncate">{kf.programFileNotes}</TableCell>
                                                            <TableCell>{new Date(kf.creationDateTime).toLocaleDateString()}</TableCell>
                                                            <TableCell>{new Date(kf.lastUpdateDT).toLocaleDateString()}</TableCell>
                                                            <TableCell>{kf.archive ? "Yes" : "No"}</TableCell>
                                                            <TableCell>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => handleDeleteKeyFile(kf.programID, kf.seqID)}
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
                                            <p>No key files added to this program yet</p>
                                        </div>
                                    )}

                                    <div className="mt-4 space-y-4 border-t pt-4">
                                        <h3 className="font-medium">Add New Key File</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="fileID">File</Label>
                                                <Select
                                                    value={newKeyFile.fileID.toString()}
                                                    onValueChange={(value) => setNewKeyFile({ ...newKeyFile, fileID: Number.parseInt(value) })}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a file" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {files.map((file) => (
                                                            <SelectItem key={file.id} value={file.id.toString()}>
                                                                {file.shortName}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="flex items-center space-x-2 mt-6">
                                                <Checkbox
                                                    id="keyFileArchive"
                                                    checked={newKeyFile.archive}
                                                    onCheckedChange={(checked) => setNewKeyFile({ ...newKeyFile, archive: checked === true })}
                                                />
                                                <Label htmlFor="keyFileArchive">Archive</Label>
                                            </div>
                                        </div>

                                        <div>
                                            <Label htmlFor="programFileNotes">Notes</Label>
                                            <Textarea
                                                id="programFileNotes"
                                                value={newKeyFile.programFileNotes}
                                                onChange={(e) => setNewKeyFile({ ...newKeyFile, programFileNotes: e.target.value })}
                                            />
                                        </div>

                                        <Button onClick={handleAddKeyFile} disabled={newKeyFile.fileID === 0}>
                                            <Plus className="mr-2 h-4 w-4" /> Add Key File
                                        </Button>
                                    </div>
                                </TabsContent>

                                <TabsContent value="notes" className="pt-4">
                                    {notes.filter((note) => note.programID === selectedProgram.id).length > 0 ? (
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Seq ID</TableHead>
                                                    <TableHead>Notes</TableHead>
                                                    <TableHead>User</TableHead>
                                                    <TableHead>Created</TableHead>
                                                    <TableHead>Updated</TableHead>
                                                    <TableHead>Archive</TableHead>
                                                    <TableHead></TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {notes
                                                    .filter((note) => note.programID === selectedProgram.id)
                                                    .map((note) => (
                                                        <TableRow key={`${note.programID}-${note.seqID}`}>
                                                            <TableCell>{note.seqID}</TableCell>
                                                            <TableCell className="max-w-[200px] truncate">{note.programNotes}</TableCell>
                                                            <TableCell>{note.userID}</TableCell>
                                                            <TableCell>{new Date(note.creationDateTime).toLocaleDateString()}</TableCell>
                                                            <TableCell>{new Date(note.lastUpdateDT).toLocaleDateString()}</TableCell>
                                                            <TableCell>{note.archive ? "Yes" : "No"}</TableCell>
                                                            <TableCell>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => handleDeleteNote(note.programID, note.seqID)}
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
                                            <p>No notes added to this program yet</p>
                                        </div>
                                    )}

                                    <div className="mt-4 space-y-4 border-t pt-4">
                                        <h3 className="font-medium">Add New Note</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="userID">User ID</Label>
                                                <Input
                                                    id="userID"
                                                    value={newNote.userID}
                                                    onChange={(e) => setNewNote({ ...newNote, userID: e.target.value })}
                                                />
                                            </div>
                                            <div className="flex items-center space-x-2 mt-6">
                                                <Checkbox
                                                    id="noteArchive"
                                                    checked={newNote.archive}
                                                    onCheckedChange={(checked) => setNewNote({ ...newNote, archive: checked === true })}
                                                />
                                                <Label htmlFor="noteArchive">Archive</Label>
                                            </div>
                                        </div>

                                        <div>
                                            <Label htmlFor="programNotes">Notes</Label>
                                            <Textarea
                                                id="programNotes"
                                                value={newNote.programNotes}
                                                onChange={(e) => setNewNote({ ...newNote, programNotes: e.target.value })}
                                            />
                                        </div>

                                        <Button onClick={handleAddNote} disabled={!newNote.programNotes || !newNote.userID}>
                                            <Plus className="mr-2 h-4 w-4" /> Add Note
                                        </Button>
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </div>
                    ) : (
                        <div className="text-center p-8">
                            <FileCode className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                            <h2 className="text-lg font-medium mb-2">No program selected</h2>
                            <p className="text-muted-foreground mb-4">Select a program from the list or create a new one</p>
                            <Button onClick={() => setShowCreateProgramDialog(true)}>
                                <Plus className="mr-2 h-4 w-4" /> Create New Program
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Create Program Dialog */}
            <Dialog open={showCreateProgramDialog} onOpenChange={setShowCreateProgramDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create a new program</DialogTitle>
                        <DialogDescription>
                            Add a new program to the system. You can add key files and notes after creating the program.
                        </DialogDescription>
                    </DialogHeader>

                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="grid w-full grid-cols-1">
                            <TabsTrigger value="program">Program Details</TabsTrigger>
                        </TabsList>

                        <TabsContent value="program" className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="programName">Program Name</Label>
                                    <Input
                                        id="programName"
                                        value={newProgram.programName}
                                        onChange={(e) => setNewProgram((prev) => ({ ...prev, programName: e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="programType">Program Type</Label>
                                    <Input
                                        id="programType"
                                        value={newProgram.programType}
                                        onChange={(e) => setNewProgram((prev) => ({ ...prev, programType: e.target.value }))}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="runningLocation">Running Location</Label>
                                    <Input
                                        id="runningLocation"
                                        value={newProgram.runningLocation}
                                        onChange={(e) => setNewProgram((prev) => ({ ...prev, runningLocation: e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="sourceLocation">Source Location</Label>
                                    <Input
                                        id="sourceLocation"
                                        value={newProgram.sourceLocation}
                                        onChange={(e) => setNewProgram((prev) => ({ ...prev, sourceLocation: e.target.value }))}
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="programDescription">Program Description</Label>
                                <Textarea
                                    id="programDescription"
                                    value={newProgram.programDescription}
                                    onChange={(e) => setNewProgram((prev) => ({ ...prev, programDescription: e.target.value }))}
                                />
                            </div>

                            <div>
                                <Label htmlFor="keyProgrammers">Key Programmers (comma separated)</Label>
                                <Input
                                    id="keyProgrammers"
                                    value={newProgram.keyProgrammers}
                                    onChange={(e) => setNewProgram((prev) => ({ ...prev, keyProgrammers: e.target.value }))}
                                    placeholder="John Doe, Jane Smith"
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                    Enter names separated by commas. You can add more after creating the program.
                                </p>
                            </div>

                            <div>
                                <Label htmlFor="keyUsers">Key Users (comma separated)</Label>
                                <Input
                                    id="keyUsers"
                                    value={newProgram.keyUsers}
                                    onChange={(e) => setNewProgram((prev) => ({ ...prev, keyUsers: e.target.value }))}
                                    placeholder="Marketing Team, Finance Department"
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                    Enter names separated by commas. You can add more after creating the program.
                                </p>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="archive"
                                    checked={newProgram.archive}
                                    onCheckedChange={(checked) => setNewProgram((prev) => ({ ...prev, archive: checked === true }))}
                                />
                                <Label htmlFor="archive">Archive</Label>
                            </div>
                        </TabsContent>
                    </Tabs>

                    <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setShowCreateProgramDialog(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleCreateProgram} disabled={!newProgram.programName}>
                            Create Program
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default Programs
