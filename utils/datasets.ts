import { getUsers, getAssignments, getSubmissions } from './api';

export interface Dataset {
  id: string;
  title: string;
  author: string;
  category: "Free" | "Premium" | "Popular";
  rating: number;
  downloads: string;
  reviews: string;
  image: string;
  fileType: "assignment" | "submission";
  fileId: string;
  fileName?: string;
}

export async function fetchDatasets(): Promise<Dataset[]> {
  try {
    // Fetch real data from backend
    const [users, assignments, submissions] = await Promise.all([
      getUsers(),
      getAssignments(),
      getSubmissions()
    ]);

    const datasets: Dataset[] = [];

    // Process assignments
    assignments.forEach((assignment: any) => {
      if (assignment.fileUrl && assignment.fileUrl.trim() !== '') {
        const user = users.find((u: any) => u.id === assignment.userId);
        if (user) {
          datasets.push({
            id: assignment.id,
            title: assignment.title || `Assignment ${assignment.id}`,
            author: `${user.username} • ${assignment.subject || 'General'}`,
            category: assignment.isPremium ? "Premium" : "Free",
            rating: assignment.rating || 4.5,
            downloads: assignment.downloads ? `${assignment.downloads}k` : "1.2k",
            reviews: assignment.reviews ? `${assignment.reviews}` : "156",
            image: assignment.imageUrl || "https://via.placeholder.com/300x200/30e8a5/11211b?text=Assignment",
            fileType: "assignment",
            fileId: assignment.id,
            fileName: assignment.fileName || `assignment_${assignment.id}.pdf`
          });
        }
      }
    });

    // Process submissions
    submissions.forEach((submission: any) => {
      if (submission.fileUrl && submission.fileUrl.trim() !== '') {
        const user = users.find((u: any) => u.id === submission.userId);
        if (user) {
          datasets.push({
            id: submission.id,
            title: submission.title || `Solution ${submission.id}`,
            author: `${user.username} • ${submission.subject || 'General'}`,
            category: submission.isPremium ? "Premium" : "Free",
            rating: submission.rating || 4.3,
            downloads: submission.downloads ? `${submission.downloads}k` : "890",
            reviews: submission.reviews ? `${submission.reviews}` : "89",
            image: submission.imageUrl || "https://via.placeholder.com/300x200/30e8a5/11211b?text=Solution",
            fileType: "submission",
            fileId: submission.id,
            fileName: submission.fileName || `solution_${submission.id}.pdf`
          });
        }
      }
    });

    // Sort by downloads and rating for featured section
    return datasets.sort((a, b) => {
      const aScore = parseFloat(a.downloads) * a.rating;
      const bScore = parseFloat(b.downloads) * b.rating;
      return bScore - aScore;
    }).slice(0, 8); // Return top 8 for featured section

  } catch (error) {
    console.error('Error fetching datasets:', error);
    // Return empty array if API fails
    return [];
  }
}

export async function searchDatasets(query: string): Promise<Dataset[]> {
  try {
    const datasets = await fetchDatasets();
    
    if (!query.trim()) return datasets;
    
    const lowercaseQuery = query.toLowerCase();
    return datasets.filter(dataset => 
      dataset.title.toLowerCase().includes(lowercaseQuery) ||
      dataset.author.toLowerCase().includes(lowercaseQuery) ||
      dataset.category.toLowerCase().includes(lowercaseQuery)
    );
  } catch (error) {
    console.error('Error searching datasets:', error);
    return [];
  }
}

export async function getDatasetsByCategory(category: string): Promise<Dataset[]> {
  try {
    const datasets = await fetchDatasets();
    
    if (category === "All") return datasets;
    
    return datasets.filter(dataset => dataset.category === category);
  } catch (error) {
    console.error('Error getting datasets by category:', error);
    return [];
  }
}
