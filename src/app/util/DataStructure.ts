// tslint:disable:no-bitwise
export namespace DataStructure {
	export type CollectioName = 'emotes' | 'users' | 'bans' | 'audit' | 'oauth';
	export const NullObjectId = '000000000000000000000000';

	/**
	 * An Emote object, representing an emote created by the app
	 *
	 * @collection emotes
	 */
	export interface Emote {
		id: string;
		name: string;
		owner?: TwitchUser;
		owner_id?: string;
		visibility: number;
		channel_count?: number;
		channels?: Partial<TwitchUser>[];
		mime?: string;
		status: Constants.Emotes.Status;
		tags: string[];
		audit_entries?: AuditLog.Entry[];
		created_at?: string | Date;
		provider?: Emote.Provider;
		urls?: [string, string][];
		height?: number[];
		width?: number[];
	}
	export namespace Emote {
		export enum Visibility {
			PRIVATE = 1 << 0,
			GLOBAL = 1 << 1,
			HIDDEN = 1 << 2,
			OVERRIDE_BTTV = 1 << 3,
			OVERRIDE_FFZ = 1 << 4,
			OVERRIDE_TWITCH_GLOBAL = 1 << 5,
			OVERRIDE_TWITCH_SUBSCRIBER = 1 << 6,
			ZERO_WIDTH = 1 << 7,
			PERMANENTLY_UNLISTED = 1 << 8
		}

		export type Provider = '7TV' | 'TWITCH' | 'BTTV' | 'FFZ' | 'EMOJI';
	}

	/**
	 * A TwitchUser object, obtained through an OAuth2 connection by an end user
	 *
	 * @collection users
	 */
	export interface TwitchUser extends MongoDocument {
		/** @deprecated - succeeded by role_id  */
		rank?: Constants.Users.Rank;
		role?: DataStructure.Role;
		emotes: Emote[];
		emote_ids: string[];
		emote_aliases: string[][];
		owned_emotes: DataStructure.Emote[];
		broadcaster_type: string;
		description: string;
		display_name: string;
		editor_ids: string;
		editor_in?: TwitchUser[];
		editors?: TwitchUser[];
		id: string;
		login: string;
		offline_image_url: string;
		profile_image_url: string;
		youtube_id?: string;
		type: string;
		view_count: number;
		email: string;
		created_at: string | Date;
		token_version?: string;
		banned?: boolean;
		bans?: Ban[];
		audit_entries: DataStructure.AuditLog.Entry[];
		emote_slots: number;
		broadcast: Broadcast;
		follower_count: number;
		notification_count?: number;
		notifications: Notification[];
		cosmetics: Cosmetic[];
	}

	export interface Cosmetic {
		id: string;
		kind: Cosmetic.Kind;
		name: string;
		data: string;
	}
	export namespace Cosmetic {
		export type Kind = 'BADGE' | 'PAINT';
	}

	export interface Broadcast {
		id: string;
		title: string;
		thumbnail_url: string;
		viewer_count: number;
		type: string;
		game_name: string;
		game_id: string;
		language: string;
		tags: string[];
		mature: boolean;
		started_at: Date | string;
		user_id: string;
	}

	/**
	 * A Role object, containing bitfields defining allowed and denied permissions
	 *
	 * @collection roles
	 */
	export interface Role {
		id: string;
		name: string;
		color: number;
		allowed: BigInt;
		denied: BigInt;
		position: number;
	}

	export interface Notification {
		id: string;
		title: string;
		timestamp: string | Date;
		message_parts: [];
		read?: boolean;
		read_at?: string | Date;
		users: TwitchUser[];
		emotes: Emote[];
	}
	export namespace Notification {
		export interface MessagePart {
			type: number;
			data: string;
		}

		export enum MessagePartType {
			TEXT = 1,
			USER_MENTION,
			EMOTE_MENTION,
			ROLE_MENTION
		}
	}

	export namespace Role {
		export const Permission = {
			/** Allows creating emotes */
			CREATE_EMOTE: BigInt(1) << BigInt(0),
			/** Allows editing own emotes */
			EDIT_EMOTE_SELF: BigInt(1) << BigInt(1),
			/** Allows editing all emotes, including those not owned by client user @elevated */
			EDIT_EMOTE_ALL: BigInt(1) << BigInt(2),

			/** Allows creating reports */
			CREATE_REPORTS: BigInt(1) << BigInt(3),
			/** Allows managing reports @elevated */
			MANAGE_REPORTS: BigInt(1) << BigInt(4),

			/** Allows banning other users @elevated */
			BAN_USERS: BigInt(1) << BigInt(5),

			/** Grants all permissions @elevated */
			ADMINISTRATOR: BigInt(1) << BigInt(6),

			/** Allows managing roles */
			MANAGE_ROLES: BigInt(1) << BigInt(7),
			/** Allows editing users @elevated */
			MANAGE_USERS: BigInt(1) << BigInt(8),

			/** Allows adding and removing editors from own channel */
			MANAGE_EDITORS: BigInt(1) << BigInt(9),

			/** Manage the application stack @elevated */
			MANAGE_STACK: BigInt(1) << BigInt(10),

			EDIT_APP_META: BigInt(1) << BigInt(11),
			MANAGE_ENTITLEMENTS: BigInt(1) << BigInt(12),
			USE_ZERO_WIDTH_EMOTE: BigInt(1) << BigInt(13),
			USE_CUSTOM_AVATAR: BigInt(1) << BigInt(14)
		};

		export const DEFAULT_PERMISSIONS = Permission.CREATE_EMOTE & Permission.EDIT_EMOTE_SELF & Permission.CREATE_REPORTS & Permission.MANAGE_EDITORS;
	}

	/**
	 * Banned users
	 *
	 * @collection bans
	 */
	export interface Ban extends MongoDocument {
		user_d: string;
		reason: string;
		active: boolean;
		issued_by_id: string;
		expire_at: Date | string;
	}

	/**
	 * AuditLog objects
	 *
	 * @collection audit
	 */
	export namespace AuditLog {
		export interface Entry extends MongoDocument {
			id: string;
			type: Entry.Type;
			timestamp: Date | string;
			action_user: TwitchUser;
			action_user_id: string;
			target?: Entry.Target;
			changes: Entry.Change[];
			reason?: string;
		}
		export namespace Entry {
			export interface Change {
				key: string;
				values?: any[];
				old_value?: any;
				new_value?: any;
			}

			export interface Target {
				type: CollectioName;
				data: string;
				id: string;
			}

			export enum Type {
				// Range 1-20 (Emote Actions)
				EMOTE_CREATE = 1, // Emote was created
				EMOTE_DELETE, // Emote was deleted
				EMOTE_DISABLE, // Emote was deleted
				EMOTE_EDIT, // Emote was edited
				EMOTE_MERGE, // Emote was merged

				// Range 21-30 (Authentication)
				AUTH_IN = 20, // User logged in
				AUTH_OUT, // User signed out

				// Range 31-50 (User Actions)
				USER_CREATE = 30, // User Created
				USER_DELETE, // User Deleted
				USER_SUSPEND, // User Suspended
				USER_EDIT, // User Edited
				USER_CHANNEL_EMOTE_ADD,
				USER_CHANNEL_EMOTE_REMOVE,
				USER_UNBAN,
				USER_CHANNEL_EDITOR_ADD,
				USER_CHANNEL_EDITOR_REMOVE,
				USER_CHANNEL_EMOTE_EDIT,

				// Range 51-70 (Administrator Actions)
				APP_MAINTENANCE_MODE = 50, // The app was set in maintenance mode, all endpoints locked for regular users
				APP_ROUTE_LOCK, // An API route was locked
				APP_LOGS_VIEW, // Logs were viewed
				APP_SCALE, // App scaled
				APP_NODE_CREATE, // New k8s worker node created
				APP_NODE_DELETE, // k8s worker node deleted
				APP_NODE_JOIN, // k8s worker node joined to the cluster
				APP_NODE_UNREF, // k8s worker node removed from the cluster
			}
		}
	}

	/**
	 * A bearer token grant object linked to a TwitchUser, obtained from a code exchange of an OAuth2 connection by an end user
	 *
	 * @collection oauth
	 */
	export interface BearerToken extends API.OAuth2.AuthCodeGrant, MongoDocument {
		user_id: string;
	}
}

export interface MongoDocument {
	_id: string;
}

export namespace Constants {
	export namespace Users {
		export enum Rank {
			DEFAULT = 0,
			MODERATOR = 1,
			ADMIN = 100
		}

		export const LOGIN_REGEXP = /^[a-zA-Z0-9_]{3,25}$/;
	}

	export namespace Emotes {
		export enum Status {
			DELETED = -1,
			PROCESSING = 0,
			PENDING = 1,
			DISABLED = 2,
			LIVE = 3
		}

		export const NAME_REGEXP = new RegExp(/^[A-Za-z_\-\(\)\:0-9]{2,100}$/);
		export const MAX_EMOTE_LENGTH = 100;
		export const MIN_EMOTE_LENGTH = 2;
		export const NAME_PATTERN_ERROR = ''.concat(
			'Emote name must be between ',
			`${MIN_EMOTE_LENGTH}-${MAX_EMOTE_LENGTH} characters, `,
			`be alphanumeric, and it may contain underscores and dashes.`
		);

		export type ALLOWED_EXTENSIONS = 'gif' | 'png' | 'webp';
	}
}

export namespace API {
	export interface TokenPayload {
		id: string;
		twid: string;
		role?: number;
	}
	export namespace OAuth2 {
		export interface AuthCodeGrant {
			access_token: string;
			refresh_token: string;
			expires_in: number;
			scope: string[];
			token_type: 'bearer';
		}
	}
}

export const BitField = {
	HasBits(sum: number, bit: number): boolean {
		return (sum & bit) == bit;
	},
	AddBits(sum: number, add: number): number {
		return sum | add;
	},
	RemoveBits(sum: number, remove: number): number {
		return sum & ~remove;
	},

	HasBits64(sum: bigint, bit: bigint): boolean {
		return (sum & bit) == bit;
	},
	AddBits64(sum: bigint, add: bigint): bigint {
		return sum | add;
	},
	RemoveBits64(sum: bigint, remove: bigint): bigint {
		return sum & ~remove;
	}
};
