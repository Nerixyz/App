import { Component, Input, OnInit } from '@angular/core';
import { ThemingService } from 'src/app/service/theming.service';
import { UserStructure } from 'src/app/util/user.structure';

@Component({
	selector: 'app-home-featured-stream',
	templateUrl: 'featured-stream.component.html',
	styleUrls: ['featured-stream.component.scss']
})

export class HomeFeaturedStreamComponent implements OnInit {
	@Input() featuredUser: UserStructure | null = null;

	constructor(
		public themingService: ThemingService
	) { }

	createTwitchPlayer(user: UserStructure): void {
		import('twitch-player').then(M => {
			M.TwitchPlayer.FromOptions('twitch-player', {
				width: 474,
				height: 354,
				channel: user.getSnapshot()?.login,
				autoplay: true,
				muted: true,
				parent: ['localhost']
			});
		});
	}

	openStream(): void {
		window.open(this.featuredUser?.getTwitchURL(), '_blank');
	}

	ngOnInit(): void {
		if (this.featuredUser != null) {
			this.createTwitchPlayer(this.featuredUser);
		}
	}
}
