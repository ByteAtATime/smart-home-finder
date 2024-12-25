export interface IAuthProvider {
	isAuthenticated: () => boolean;
	getUserId: () => Promise<string | null>;
}
