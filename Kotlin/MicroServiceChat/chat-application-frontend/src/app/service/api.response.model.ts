/**
 * Matches Spring Boot ApiResponse<T> data class from AdminController.kt:
 * data class ApiResponse<T>(
 *   val success: Boolean,
 *   val message: String,
 *   val data: T?,
 *   val timestamp: Long = System.currentTimeMillis()
 * )
 *
 * IMPORTANT: Not all endpoints use this wrapper:
 * - AuthController.register()         → RegisterResponse directly (no wrapper)
 * - AuthController.refreshToken()     → TokenResponse directly (no wrapper)
 * - AuthController.verifyEmail()      → void (empty body)
 * - AuthController.resendVerification → void
 * - AuthController.forgotPassword()   → void
 * - AuthController.resetPassword()    → { success, message } plain map (no timestamp)
 * - AdminController.getUserById()     → UserProfileResponse directly (no wrapper)
 * - AdminController.getUserBasicInfo()→ UserResponse directly (no wrapper)
 * - AdminController.updateUser()      → AdminUserResponse directly (no wrapper)
 * - AdminController.deleteUser()      → void (HTTP 204)
 *
 * Endpoints WITH ApiResponse wrapper:
 * - AuthController.login()            → ApiResponse<LoginResponse>
 * - AdminController.getAllUsers()      → ApiResponse<List<UserProfileResponse>>
 */
export interface ApiResponse<T = void> {
  success: boolean;
  message: string;
  data?: T;
  timestamp: number;
}