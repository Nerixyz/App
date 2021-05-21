

import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatMenu } from '@angular/material/menu';
import { Router } from '@angular/router';
import Color from 'color';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { EmoteListService } from 'src/app/emotes/emote-list/emote-list.service';
import { ClientService } from 'src/app/service/client.service';
import { ThemingService } from 'src/app/service/theming.service';
import { WindowRef } from 'src/app/service/window.service';
import { Structure } from 'src/app/util/abstract.structure';
import { BanDialogComponent } from 'src/app/util/dialog/error-dialog/ban-dialog/ban-dialog.component';
import { EmoteStructure } from 'src/app/util/emote.structure';
import { UserStructure } from 'src/app/util/user.structure';

@Component({
	selector: 'app-ctx-menu',
	templateUrl: 'ctx-menu.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class ContextMenuComponent implements OnInit {
	@ViewChild('emoteContextMenu') emoteMenu: MatMenu | null = null;
	@ViewChild('userContextMenu') userMenu: MatMenu | null = null;
	@Output() interact = new EventEmitter<ContextMenuComponent.InteractButton>();

	constructor(
		private router: Router,
		private themingService: ThemingService,
		private emoteListService: EmoteListService,
		private windowRef: WindowRef,
		private dialog: MatDialog,
		public clientService: ClientService,
	) { }

	@Input() contextEmote: EmoteStructure | null = null;
	@Input() contextUser: UserStructure | null = null;
	contextMenuOptions = {
		emote: [
			{
				label: 'Open in New Tab',
				icon: 'open_in_new',
				click: emote => {
					const url = this.router.serializeUrl(this.router.createUrlTree(['/emotes', String(emote.getID())]));

					return of(this.windowRef.getNativeWindow()?.open(url, '_blank'));
				}
			},
			{
				label: 'Copy Link',
				icon: 'link',
				click: emote => of(this.windowRef.copyValueToClipboard(''.concat(
					`https://${this.windowRef.getNativeWindow()?.location.host}`, // Get window location.host
					this.router.serializeUrl(this.router.createUrlTree(['/emotes', String(emote.getID())]))
				)))
			},
			...this.emoteListService.interactions
		] as ContextMenuComponent.InteractButton<EmoteStructure>[],

		user: [
			{
				label: 'Open in New Tab',
				icon: 'open_in_new',
				click: user => {
					const url = this.router.serializeUrl(this.router.createUrlTree(['/users', String(user.id)]));

					return of(this.windowRef.getNativeWindow()?.open(url, '_blank'));
				}
			},
			{
				label: 'Copy Link',
				icon: 'link',
				click: user => of(this.windowRef.copyValueToClipboard(''.concat(
					`https://${this.windowRef.getNativeWindow()?.location.host}`, // Get window location.host
					this.router.serializeUrl(this.router.createUrlTree(['/users', String(user.id)]))
				)))
			},
			{
				label: 'Change Role',
				icon: 'flag',
				click: victim => of(undefined),
				condition: victim => this.clientService.hasPermission('MANAGE_ROLES').pipe(
					switchMap(canBan => victim.getRole().pipe(map(role => ({ victimRole: role, canBan })))),
					switchMap(({ canBan, victimRole }) => this.clientService.getRole().pipe(map(role => ({ canBan, victimRole, role })))),
					map(({ canBan, victimRole, role }) => canBan && role.getPosition() > victimRole.getPosition())
				)
			},
			{
				label: 'Ban',
				icon: 'gavel',
				color: this.themingService.warning,
				click: victim => new Observable<void>(observer => {
					this.dialog.open(BanDialogComponent, {
						data: { user: victim }
					});

					observer.complete();
				}),
				condition: victim => this.clientService.hasPermission('BAN_USERS').pipe(
					switchMap(canBan => victim.getRole().pipe(map(role => ({ victimRole: role, canBan })))),
					switchMap(({ canBan, victimRole }) => this.clientService.getRole().pipe(map(role => ({ canBan, victimRole, role })))),
					map(({ canBan, victimRole, role }) => canBan && role.getPosition() > victimRole.getPosition())
				)
			}
		] as ContextMenuComponent.InteractButton<UserStructure>[]
	};

	onContextInteract(button: ContextMenuComponent.InteractButton, s: Structure<any>): void {
		if (typeof button.click === 'function' && !!s) {
			button.click(s).subscribe();
		}

		this.interact.emit(button);
	}

	ngOnInit(): void {}
}

export namespace ContextMenuComponent {
	export interface InteractButton<S = any> {
		label: string;
		color?: Color;
		icon?: string;
		disabled?: boolean;
		condition: (s: S) => Observable<boolean>;
		click?: (s: S) => Observable<void>;
	}
}
