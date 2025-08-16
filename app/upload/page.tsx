// "use client";

// import type React from "react";

// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Label } from "@/components/ui/label";
// import { useAuth } from "@/context/AuthContext";
// import { toast } from "@/hooks/use-toast";
// import { Loader2, Upload, Calendar } from "lucide-react";
// import dynamic from "next/dynamic";
// const Header = dynamic(() => import("@/components/Header"), {
//   ssr: false,
//   loading: () => <div className="h-16" />,
// });
// import { uploadAssignment } from "@/utils/api";

// export default function UploadPage() {
//   const { user } = useAuth();
//   const router = useRouter();
//   const [loading, setLoading] = useState(false);
//   const [formData, setFormData] = useState({
//     title: "",
//     description: "",
//     difficulty: "",
//     deadline: "",
//     subject: "",
//   });
//   const [file, setFile] = useState<File | null>(null);

//   useEffect(() => {
//     if (!user) {
//       router.push("/");
//     }
//   }, [user, router]);

//   if (!user) return null;

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     // Debug logging
//     console.log("formData:", formData);
//     console.log("user.id:", user.id);
//     console.log("user.username:", user.username);
//     if (
//       !formData.title.trim() ||
//       !formData.description.trim() ||
//       !formData.difficulty.trim() ||
//       !formData.deadline.trim() ||
//       !user.id ||
//       !user.username
//     ) {
//       toast({
//         title: "Error",
//         description: "Please fill in all required fields.",
//         variant: "destructive",
//       });
//       return;
//     }

//     setLoading(true);
//     try {
//       await uploadAssignment({
//         ...formData,
//         file,
//         createdBy: user.id,
//         createdByUsername: user.username,
//       });

//       toast({
//         title: "Success!",
//         description: "Your assignment has been uploaded successfully.",
//       });
//       router.replace("/activity");
//     } catch (error) {
//       toast({
//         title: "Error",
//         description: "Failed to upload assignment. Please try again.",
//         variant: "destructive",
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleInputChange = (field: string, value: string) => {
//     setFormData((prev) => ({ ...prev, [field]: value }));
//   };

//   return (
//     <div className="min-h-screen bg-[#fcfbf8]">
//       <Header />

//       <div className="px-4 py-8 sm:px-6 lg:px-8">
//         <div className="mx-auto max-w-2xl">
//           <div className="mb-8">
//             <h1 className="text-3xl font-bold text-[#1c180d] mb-2">
//               Upload Assignment
//             </h1>
//             <p className="text-[#9e8747]">
//               Share your assignment anonymously and get help from the community.
//             </p>
//           </div>

//           <Card className="border-[#e9e2ce] bg-[#fcfbf8]">
//             <CardHeader>
//               <CardTitle className="text-[#1c180d]">
//                 Assignment Details
//               </CardTitle>
//               <CardDescription className="text-[#9e8747]">
//                 Fill out the form below to submit your assignment. All
//                 submissions are anonymous.
//               </CardDescription>
//             </CardHeader>
//             <CardContent>
//               <form onSubmit={handleSubmit} className="space-y-6">
//                 <div className="space-y-2">
//                   <Label htmlFor="title" className="text-[#1c180d]">
//                     Assignment Title *
//                   </Label>
//                   <Input
//                     id="title"
//                     placeholder="Enter the title of your assignment"
//                     value={formData.title}
//                     onChange={(e) => handleInputChange("title", e.target.value)}
//                     className="border-[#e9e2ce] bg-[#fcfbf8] focus:border-[#fac638]"
//                     required
//                   />
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="description" className="text-[#1c180d]">
//                     Description *
//                   </Label>
//                   <Textarea
//                     id="description"
//                     placeholder="Provide a detailed description of your assignment, including any specific requirements or guidelines"
//                     value={formData.description}
//                     onChange={(e) =>
//                       handleInputChange("description", e.target.value)
//                     }
//                     className="border-[#e9e2ce] bg-[#fcfbf8] focus:border-[#fac638] min-h-32"
//                     required
//                   />
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div className="space-y-2">
//                     <Label htmlFor="subject" className="text-[#1c180d]">
//                       Subject Area
//                     </Label>
//                     <Select
//                       value={formData.subject}
//                       onValueChange={(value) =>
//                         handleInputChange("subject", value)
//                       }
//                     >
//                       <SelectTrigger
//                         id="subject"
//                         className="border-[#e9e2ce] bg-[#fcfbf8] focus:border-[#fac638]"
//                       >
//                         <SelectValue placeholder="Select subject area" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="mathematics">Mathematics</SelectItem>
//                         <SelectItem value="science">Science</SelectItem>
//                         <SelectItem value="computer-science">
//                           Computer Science
//                         </SelectItem>
//                         <SelectItem value="physics">Physics</SelectItem>
//                         <SelectItem value="chemistry">Chemistry</SelectItem>
//                         <SelectItem value="biology">Biology</SelectItem>
//                         <SelectItem value="english">English</SelectItem>
//                         <SelectItem value="history">History</SelectItem>
//                         <SelectItem value="economics">Economics</SelectItem>
//                         <SelectItem value="other">Other</SelectItem>
//                       </SelectContent>
//                     </Select>
//                   </div>

//                   <div className="space-y-2">
//                     <Label htmlFor="difficulty" className="text-[#1c180d]">
//                       Difficulty Level *
//                     </Label>
//                     <Select
//                       value={formData.difficulty}
//                       onValueChange={(value) =>
//                         handleInputChange("difficulty", value)
//                       }
//                     >
//                       <SelectTrigger
//                         id="difficulty"
//                         className="border-[#e9e2ce] bg-[#fcfbf8] focus:border-[#fac638]"
//                       >
//                         <SelectValue placeholder="Select difficulty" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="easy">Easy</SelectItem>
//                         <SelectItem value="medium">Medium</SelectItem>
//                         <SelectItem value="hard">Hard</SelectItem>
//                       </SelectContent>
//                     </Select>
//                   </div>
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="deadline" className="text-[#1c180d]">
//                     Deadline *
//                   </Label>
//                   <div className="relative">
//                     <Input
//                       id="deadline"
//                       type="datetime-local"
//                       value={formData.deadline}
//                       onChange={(e) =>
//                         handleInputChange("deadline", e.target.value)
//                       }
//                       className="border-[#e9e2ce] bg-[#fcfbf8] focus:border-[#fac638]"
//                       required
//                     />
//                     <Calendar className="absolute right-3 top-3 h-4 w-4 text-[#9e8747]" />
//                   </div>
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="file" className="text-[#1c180d]">
//                     Assignment File (Optional)
//                   </Label>
//                   <div className="border-2 border-dashed border-[#e9e2ce] rounded-lg p-6 text-center">
//                     <Upload className="mx-auto h-8 w-8 text-[#9e8747] mb-2" />
//                     <p className="text-sm text-[#1c180d] mb-2">
//                       Upload your assignment file
//                     </p>
//                     <p className="text-xs text-[#9e8747] mb-4">
//                       Supported formats: PDF, DOC, DOCX, TXT (Max 10MB)
//                     </p>
//                     <Input
//                       id="file"
//                       type="file"
//                       accept=".pdf,.doc,.docx,.txt"
//                       onChange={(e) => setFile(e.target.files?.[0] || null)}
//                       className="border-[#e9e2ce] bg-[#fcfbf8]"
//                     />
//                   </div>
//                   {file && (
//                     <p className="text-sm text-[#1c180d]">
//                       Selected: {file.name}
//                     </p>
//                   )}
//                 </div>

//                 <div className="flex gap-4">
//                   <Button
//                     type="button"
//                     variant="outline"
//                     onClick={() => router.back()}
//                     className="flex-1 border-[#e9e2ce] text-[#1c180d] hover:bg-[#f4f0e6]"
//                   >
//                     Cancel
//                   </Button>
//                   <Button
//                     type="submit"
//                     disabled={loading}
//                     className="flex-1 bg-[#fac638] text-[#1c180d] hover:bg-[#fac638]/90"
//                   >
//                     {loading ? (
//                       <>
//                         <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                         Uploading...
//                       </>
//                     ) : (
//                       "Upload Assignment"
//                     )}
//                   </Button>
//                 </div>
//               </form>
//             </CardContent>
//           </Card>
//         </div>
//       </div>
//     </div>
//   );
// }


"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";
import { Loader2, Upload, Calendar } from "lucide-react";
import dynamic from "next/dynamic";
const Header = dynamic(() => import("@/components/Header"), {
  ssr: false,
  loading: () => <div className="h-16" />,
});
import { uploadAssignment } from "@/utils/api";

export default function UploadPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    difficulty: "",
    deadline: "",
    subject: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push("/");
    }
  }, [user, router]);

  if (!user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Debug logging
    console.log("formData:", formData);
    console.log("user.id:", user.id);
    console.log("user.username:", user.username);
    if (
      !formData.title.trim() ||
      !formData.description.trim() ||
      !formData.difficulty.trim() ||
      !formData.deadline.trim() ||
      !user.id ||
      !user.username
    ) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await uploadAssignment({
        ...formData,
        file,
        createdBy: user.id,
        createdByUsername: user.username,
      });

      toast({
        title: "Success!",
        description: "Your assignment has been uploaded successfully.",
      });
      router.replace("/activity");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload assignment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileSelect = (selectedFile: File) => {
    const validTypes = ['.pdf', '.doc', '.docx', '.txt'];
    const fileExtension = '.' + selectedFile.name.split('.').pop()?.toLowerCase();
    
    if (!validTypes.includes(fileExtension)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF, DOC, DOCX, or TXT file.",
        variant: "destructive",
      });
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) { // 10MB
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 10MB.",
        variant: "destructive",
      });
      return;
    }

    setFile(selectedFile);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfbf8]">
      <Header />

      <div className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#1c180d] mb-2">
              Upload Assignment
            </h1>
            <p className="text-[#9e8747]">
              Share your assignment anonymously and get help from the community.
            </p>
          </div>

          <Card className="border-[#e9e2ce] bg-[#fcfbf8]">
            <CardHeader>
              <CardTitle className="text-[#1c180d]">
                Assignment Details
              </CardTitle>
              <CardDescription className="text-[#9e8747]">
                Fill out the form below to submit your assignment. All
                submissions are anonymous.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-[#1c180d]">
                    Assignment Title *
                  </Label>
                  <Input
                    id="title"
                    placeholder="Enter the title of your assignment"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    className="border-[#e9e2ce] bg-[#fcfbf8] focus:border-[#fac638]"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-[#1c180d]">
                    Description *
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Provide a detailed description of your assignment, including any specific requirements or guidelines"
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    className="border-[#e9e2ce] bg-[#fcfbf8] focus:border-[#fac638] min-h-32"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="subject" className="text-[#1c180d]">
                      Subject Area
                    </Label>
                    <Select
                      value={formData.subject}
                      onValueChange={(value) =>
                        handleInputChange("subject", value)
                      }
                    >
                      <SelectTrigger
                        id="subject"
                        className="border-[#e9e2ce] bg-[#fcfbf8] focus:border-[#fac638]"
                      >
                        <SelectValue placeholder="Select subject area" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mathematics">Mathematics</SelectItem>
                        <SelectItem value="science">Science</SelectItem>
                        <SelectItem value="computer-science">
                          Computer Science
                        </SelectItem>
                        <SelectItem value="physics">Physics</SelectItem>
                        <SelectItem value="chemistry">Chemistry</SelectItem>
                        <SelectItem value="biology">Biology</SelectItem>
                        <SelectItem value="english">English</SelectItem>
                        <SelectItem value="history">History</SelectItem>
                        <SelectItem value="economics">Economics</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="difficulty" className="text-[#1c180d]">
                      Difficulty Level *
                    </Label>
                    <Select
                      value={formData.difficulty}
                      onValueChange={(value) =>
                        handleInputChange("difficulty", value)
                      }
                    >
                      <SelectTrigger
                        id="difficulty"
                        className="border-[#e9e2ce] bg-[#fcfbf8] focus:border-[#fac638]"
                      >
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deadline" className="text-[#1c180d]">
                    Deadline *
                  </Label>
                  <div className="relative">
                    <Input
                      id="deadline"
                      type="datetime-local"
                      value={formData.deadline}
                      onChange={(e) =>
                        handleInputChange("deadline", e.target.value)
                      }
                      className="border-[#e9e2ce] bg-[#fcfbf8] focus:border-[#fac638]"
                      required
                    />
                    <Calendar className="absolute right-3 top-3 h-4 w-4 text-[#9e8747]" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="file" className="text-[#1c180d]">
                    Assignment File (Optional)
                  </Label>
                  <div 
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                      dragActive 
                        ? 'border-[#fac638] bg-[#fac638]/10' 
                        : 'border-[#e9e2ce]'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <Upload className="mx-auto h-8 w-8 text-[#9e8747] mb-2" />
                    <p className="text-sm text-[#1c180d] mb-2">
                      {dragActive ? 'Drop your file here' : 'Drag & drop your file here or click to browse'}
                    </p>
                    <p className="text-xs text-[#9e8747] mb-4">
                      Supported formats: PDF, DOC, DOCX, TXT (Max 10MB)
                    </p>
                    <Input
                      id="file"
                      type="file"
                      accept=".pdf,.doc,.docx,.txt"
                      onChange={(e) => {
                        const selectedFile = e.target.files?.[0];
                        if (selectedFile) {
                          handleFileSelect(selectedFile);
                        }
                      }}
                      className="border-[#e9e2ce] bg-[#fcfbf8]"
                    />
                  </div>
                  {file && (
                    <p className="text-sm text-[#1c180d]">
                      Selected: {file.name}
                    </p>
                  )}
                </div>

                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    className="flex-1 border-[#e9e2ce] text-[#1c180d] hover:bg-[#f4f0e6]"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-[#fac638] text-[#1c180d] hover:bg-[#fac638]/90"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      "Upload Assignment"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}