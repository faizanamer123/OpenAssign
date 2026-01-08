import { getApiBaseUrl, getEnvironmentInfo } from "../config/api";

// Get API base URL dynamically
const getApiBase = () => getApiBaseUrl();

// Log environment info in development
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  const envInfo = getEnvironmentInfo();
  console.log("🌍 API Environment:", {
    environment: envInfo.environment,
    apiBaseUrl: envInfo.apiBaseUrl,
  });
}

export async function uploadAssignment(data: any): Promise<any> {
  try {
    let body: BodyInit;

    // Use FormData for all fields (file optional)
    const formData = new FormData();
    // Normalize deadline to ISO string to prevent server-side deletion of "expired" uploads
    const normalized: Record<string, any> = { ...data };
    if (normalized.deadline) {
      const d = new Date(normalized.deadline);
      if (!Number.isNaN(d.getTime())) normalized.deadline = d.toISOString();
    }
    Object.entries(normalized).forEach(([key, value]) => {
      if (key === "file") {
        if (value instanceof File || value instanceof Blob) {
          formData.append("file", value);
        }
      } else if (value !== undefined && value !== null) {
        formData.append(key, String(value)); // Force all non-file fields to string
      }
    });
    body = formData;

    const res = await fetch(`${getApiBase()}/assignments`, {
      method: "POST",
      body,
      // headers left empty so browser sets Content-Type
    });
    if (!res.ok) throw new Error("Failed to upload assignment");
    return await res.json();
  } catch (error) {
    throw error;
  }
}

// Assignments
export async function getAssignments(): Promise<any[]> {
  try {
    const res = await fetch(`${getApiBase()}/assignments`);
    if (!res.ok) throw new Error("Failed to fetch assignments");
    return await res.json();
  } catch {
    return [];
  }
}

export async function getAssignment(id: string): Promise<any | null> {
  try {
    const res = await fetch(`${getApiBase()}/assignments/${id}`);
    if (!res.ok) throw new Error("Failed to fetch assignment");
    return await res.json();
  } catch {
    return null;
  }
}

export async function submitSolution(data: any): Promise<any> {
  try {
    let body: BodyInit;
    let useFormData = !!data.file;
    let headers: Record<string, string> = {};

    if (useFormData) {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (key === "file") {
          if (value instanceof File || value instanceof Blob) {
            formData.append("file", value);
          }
        } else if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });
      body = formData;
      // Do not set Content-Type for FormData
    } else {
      body = JSON.stringify(data);
      headers["Content-Type"] = "application/json";
    }

    const res = await fetch(`${getApiBase()}/submissions`, {
      method: "POST",
      body,
      headers,
    });
    if (!res.ok) throw new Error("Failed to submit solution");
    return await res.json();
  } catch (error) {
    throw error;
  }
}

// Submissions
export async function getSubmissions(
  params: Record<string, string> = {}
): Promise<any[]> {
  const url = new URL(`${getApiBase()}/submissions`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.append(k, v));
  try {
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error("Failed to fetch submissions");
    return await res.json();
  } catch {
    return [];
  }
}

export async function uploadSubmission(data: any): Promise<any> {
  try {
    const res = await fetch(`${getApiBase()}/submissions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to upload submission");
    return await res.json();
  } catch (error) {
    throw error;
  }
}

// Notifications
export async function getNotifications(
  params: Record<string, string> = {}
): Promise<any[]> {
  const url = new URL(`${getApiBase()}/notifications`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.append(k, v));
  try {
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error("Failed to fetch notifications");
    return await res.json();
  } catch {
    return [];
  }
}

export async function createNotification(data: any): Promise<any> {
  try {
    const res = await fetch(`${getApiBase()}/notifications`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to create notification");
    return await res.json();
  } catch (error) {
    throw error;
  }
}

export async function markNotificationRead(id: string, userId?: string): Promise<any> {
  try {
    const url = new URL(`${getApiBase()}/notifications/${id}/read`);
    if (userId) {
      url.searchParams.append("userId", userId);
    }
    const res = await fetch(url.toString(), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userId ? { userId } : {}),
    });
    if (!res.ok) throw new Error("Failed to mark notification as read");
    return await res.json();
  } catch (error) {
    throw error;
  }
}

export async function markAllNotificationsRead(userId: string): Promise<any> {
  try {
    const res = await fetch(`${getApiBase()}/notifications/read-all`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    if (!res.ok) throw new Error("Failed to mark all notifications as read");
    return await res.json();
  } catch (error) {
    throw error;
  }
}

export async function deleteNotification(id: string, userId?: string): Promise<any> {
  try {
    const url = new URL(`${getApiBase()}/notifications/${id}`);
    if (userId) {
      url.searchParams.append("userId", userId);
    }
    const res = await fetch(url.toString(), {
      method: "DELETE",
      // No body for DELETE requests - userId is in query params
      // No Content-Type header needed without body
    });
    if (!res.ok) {
      const errorText = await res.text().catch(() => "Failed to delete notification");
      throw new Error(errorText || "Failed to delete notification");
    }
    // DELETE may return 204 No Content, so handle empty response
    if (res.status === 204 || res.headers.get("content-length") === "0") {
      return { success: true };
    }
    // Try to parse JSON response, but don't fail if empty
    try {
      return await res.json();
    } catch {
      return { success: true };
    }
  } catch (error) {
    console.error("Error deleting notification:", error);
    throw error;
  }
}

// Users
export async function getUsers(): Promise<any[]> {
  try {
    const res = await fetch(`${getApiBase()}/users`);
    if (!res.ok) throw new Error("Failed to fetch users");
    return await res.json();
  } catch {
    return [];
  }
}

export async function getUserById(id: string): Promise<any | null> {
  try {
    const res = await fetch(`${getApiBase()}/users/${id}`);
    if (!res.ok) throw new Error("Failed to fetch user");
    return await res.json();
  } catch {
    return null;
  }
}

// OTP verification functions
export async function sendOTP(email: string): Promise<{
  success: boolean;
  message?: string;
  error?: string;
  userExists?: boolean;
  user?: any;
  otp?: string;
}> {
  try {
    const res = await fetch(`${getApiBase()}/otp/send-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();

    if (!res.ok) {
      return { success: false, error: data.error || "Failed to send OTP" };
    }

    return {
      success: true,
      message: data.message,
      userExists: data.userExists,
      user: data.user,
      otp: data.otp, // <-- include OTP in return value
    };
  } catch (error) {
    return { success: false, error: "Network error while sending OTP" };
  }
}

export async function verifyOTP(
  email: string,
  otp: string
): Promise<{
  success: boolean;
  message?: string;
  error?: string;
  userExists?: boolean;
  user?: any;
}> {
  try {
    const res = await fetch(`${getApiBase()}/otp/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    });

    const data = await res.json();

    if (!res.ok) {
      return { success: false, error: data.error || "Failed to verify OTP" };
    }

    return {
      success: true,
      message: data.message,
      userExists: data.userExists,
      user: data.user,
    };
  } catch (error) {
    return { success: false, error: "Network error while verifying OTP" };
  }
}

export async function createUser(data: any): Promise<any> {
  try {
    const res = await fetch(`${getApiBase()}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to create user");
    return await res.json();
  } catch (error) {
    throw error;
  }
}

export async function getLeaderboard(
  sort: "points" | "rating" = "points"
): Promise<any[]> {
  try {
    const res = await fetch(`${getApiBase()}/leaderboard?sort=${sort}`);
    if (!res.ok) throw new Error("Failed to fetch leaderboard");
    return await res.json();
  } catch {
    return [];
  }
}

export async function rateSubmission(
  submissionId: string,
  rating: number,
  raterId: string
): Promise<any> {
  try {
    const res = await fetch(
      `${getApiBase()}/submissions/${submissionId}/rate`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, raterId }),
      }
    );
    if (!res.ok) throw new Error("Failed to rate submission");
    return await res.json();
  } catch (error) {
    throw error;
  }
}

export async function sendEmailNotification(
  email: string,
  subject: string,
  message: string
): Promise<void> {
  // Mock email sending - in real app, this would use Firebase Functions + SendGrid
  console.log(`Email sent to ${email}: ${subject} - ${message}`);
}

export async function getAnalytics() {
  const res = await fetch(`${getApiBase()}/analytics`);
  if (!res.ok) throw new Error("Failed to fetch analytics");
  const data = await res.json();
  // Ensure all expected fields are present, even if 0
  return {
    totalUsers: data.totalUsers ?? 0,
    totalAssignments: data.totalAssignments ?? 0,
    solvedAssignments: data.solvedAssignments ?? 0,
    averageRating: data.averageRating ?? 0,
    uploadsPerDay: Array.isArray(data.uploadsPerDay) ? data.uploadsPerDay : [],
    ratingsDist: Array.isArray(data.ratingsDist) ? data.ratingsDist : [],
    topUsers: Array.isArray(data.topUsers) ? data.topUsers : [],
    // Advanced analytics fields
    userGrowth: Array.isArray(data.userGrowth) ? data.userGrowth : [], // [{date, count}]
    assignmentCategories: Array.isArray(data.assignmentCategories)
      ? data.assignmentCategories
      : [], // [{category, count}]
    avgSubmissionSpeed:
      typeof data.avgSubmissionSpeed === "number" ? data.avgSubmissionSpeed : 0, // in hours
    activeUsers7d:
      typeof data.activeUsers7d === "number" ? data.activeUsers7d : 0,
    activeUsers30d:
      typeof data.activeUsers30d === "number" ? data.activeUsers30d : 0,
    leaderboardTrends: Array.isArray(data.leaderboardTrends)
      ? data.leaderboardTrends
      : [], // [{username, data: [{date, points}]}]
  };
}

export async function checkEmailVerified(email: string): Promise<boolean> {
  try {
    const res = await fetch(`${getApiBase()}/users`);
    if (!res.ok) return false;
    const users = await res.json();
    const user = users.find((u: any) => u.email === email);
    return user && user.emailVerified === 1;
  } catch {
    return false;
  }
}

// Discussion functions
export async function getDiscussionComments(
  assignmentId: string,
  userId: string
): Promise<any[]> {
  try {
    const url = new URL(`${getApiBase()}/discussion/all`);
    url.searchParams.append("assignmentId", assignmentId);
    url.searchParams.append("userId", userId);

    const res = await fetch(url.toString());
    if (!res.ok) {
      if (res.status === 404) {
        console.warn(
          "Discussion API endpoint not found, returning empty array"
        );
        return [];
      }
      throw new Error("Failed to fetch discussion comments");
    }
    return await res.json();
  } catch (error) {
    console.error("Error fetching discussion comments:", error);
    // Return empty array instead of throwing to prevent app crashes
    return [];
  }
}

export async function createDiscussionComment(data: {
  assignmentId: string;
  userId: string;
  content: string;
  parentId?: string;
}): Promise<any> {
  try {
    const res = await fetch(`${getApiBase()}/discussion/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      if (res.status === 404) {
        throw new Error("Discussion API endpoint not implemented yet");
      }
      throw new Error("Failed to create discussion comment");
    }
    const result = await res.json();
    console.log("Comment creation response:", result);
    return result;
  } catch (error) {
    console.error("Error creating discussion comment:", error);
    throw error;
  }
}
