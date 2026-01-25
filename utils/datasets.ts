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
  fileType: "assignment" | "submission" | "dataset";
  fileId: string;
  fileName?: string;
  price?: number;
  awsfileUrl?: string;
  publication?: string | null;
}

// New API function to fetch datasets from the dataset endpoint
export async function fetchDatasetAPI(): Promise<any[]> {
  try {
    // Add timeout to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/dataset`, {
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('Request timeout: Dataset API call took too long');
    } else {
      console.error('Error fetching datasets from API:', error);
    }
    return [];
  }
}

// New function to download dataset files
export async function downloadDatasetFile(email: string, fileId: string): Promise<void> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE}/dataset/download?email=${encodeURIComponent(email)}&fileId=${encodeURIComponent(fileId)}`
    );
    
    if (!response.ok) {
      throw new Error(`Download failed! status: ${response.status}`);
    }
    
    // Get the blob from response
    const blob = await response.blob();
    
    // Extract filename from Content-Disposition header or use fallback
    const contentDisposition = response.headers.get('Content-Disposition');
    let filename = `dataset_${fileId}`;
    
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1].replace(/['"]/g, '');
      }
    }
    
    // Create download link and trigger download
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
  } catch (error) {
    console.error('Error downloading dataset file:', error);
    throw error;
  }
}

export async function fetchDatasets(): Promise<Dataset[]> {
  try {
    // Fetch datasets from the new API
    const apiDatasets = await fetchDatasetAPI();
    
    // Also fetch existing assignments and submissions for compatibility
    const [users, assignments, submissions] = await Promise.all([
      getUsers().catch(() => []), // Add error handling for each API call
      getAssignments().catch(() => []),
      getSubmissions().catch(() => [])
    ]);

    const datasets: Dataset[] = [];

    // Process new API datasets
    if (Array.isArray(apiDatasets)) {
      apiDatasets.forEach((dataset: any) => {
        try {
          datasets.push({
            id: dataset.id,
            title: dataset.title,
            author: dataset.author,
            category: dataset.price > 0 ? "Premium" : "Free",
            rating: 4.5, // Default rating for new datasets
            downloads: Math.floor(Math.random() * 5000 + 100).toString(), // Random downloads for demo
            reviews: Math.floor(Math.random() * 200 + 10).toString(), // Random reviews for demo
            image: "https://via.placeholder.com/300x200/30e8a5/11211b?text=Dataset",
            fileType: "dataset",
            fileId: dataset.id,
            fileName: dataset.awsfileUrl?.split('/').pop() || `dataset_${dataset.id}`,
            price: dataset.price,
            awsfileUrl: dataset.awsfileUrl,
            publication: dataset.publication
          });
        } catch (error) {
          console.error('Error processing dataset:', dataset, error);
        }
      });
    }

    // Process assignments (existing functionality)
    if (Array.isArray(assignments)) {
      assignments.forEach((assignment: any) => {
        try {
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
        } catch (error) {
          console.error('Error processing assignment:', assignment, error);
        }
      });
    }

    // Process submissions (existing functionality)
    if (Array.isArray(submissions)) {
      submissions.forEach((submission: any) => {
        try {
          if (submission.fileUrl && submission.fileUrl.trim() !== '') {
            const user = users.find((u: any) => u.id === submission.userId);
            if (user) {
              datasets.push({
                id: submission.id,
                title: submission.title || `Solution ${submission.id}`,
                author: `${user.username} • ${submission.subject || 'General'}`,
                category: submission.isPremium ? "Premium" : "Free",
                rating: submission.rating || 4.5,
                downloads: submission.downloads ? `${submission.downloads}k` : "800",
                reviews: submission.reviews ? `${submission.reviews}` : "89",
                image: submission.imageUrl || "https://via.placeholder.com/300x200/30e8a5/11211b?text=Solution",
                fileType: "submission",
                fileId: submission.id,
                fileName: submission.fileName || `solution_${submission.id}.pdf`
              });
            }
          }
        } catch (error) {
          console.error('Error processing submission:', submission, error);
        }
      });
    }

    // Sort by downloads and rating for featured section
    return datasets.sort((a, b) => {
      const aScore = parseFloat(a.downloads) * a.rating;
      const bScore = parseFloat(b.downloads) * b.rating;
      return bScore - aScore;
    }).slice(0, 12); // Return top 12 for featured section

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
