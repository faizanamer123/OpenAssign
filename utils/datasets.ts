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

export async function fetchDatasetAPI(): Promise<any[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

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

export async function downloadDatasetFile(email: string, fileId: string): Promise<void> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE}/dataset/download?email=${encodeURIComponent(email)}&fileId=${encodeURIComponent(fileId)}`
    );
    
    if (!response.ok) {
      throw new Error(`Download failed! status: ${response.status}`);
    }
    
    const blob = await response.blob();
    
    if (blob.size === 0) {
      throw new Error('Downloaded file is empty');
    }
    
    const contentDisposition = response.headers.get('Content-Disposition');
    let filename = `dataset_${fileId}.csv`;
    
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1].replace(/['"]/g, '');
      }
    }
    
    if (!filename.includes('.')) {
      filename += '.csv';
    }
    
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    
    setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }, 100);
    
  } catch (error) {
    console.error('Error downloading dataset file:', error);
    throw error;
  }
}

export async function fetchDatasets(): Promise<Dataset[]> {
  try {
    const apiDatasets = await fetchDatasetAPI();
    
    const [users, assignments, submissions] = await Promise.all([
      getUsers().catch(() => []),
      getAssignments().catch(() => []),
      getSubmissions().catch(() => [])
    ]);

    const datasets: Dataset[] = [];

    if (Array.isArray(apiDatasets)) {
      apiDatasets.forEach((dataset: any) => {
        try {
          datasets.push({
            id: dataset.id,
            title: dataset.title,
            author: dataset.author,
            category: dataset.price > 0 ? "Premium" : "Free",
            rating: 4.5,
            downloads: "1000",
            reviews: "50",
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

    return datasets.sort((a, b) => a.id.localeCompare(b.id)).slice(0, 12);

  } catch (error) {
    console.error('Error fetching datasets:', error);
    return [];
  }
}
