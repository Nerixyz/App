import { trigger, transition, query, style, stagger, animate, keyframes, group } from '@angular/animations';
import { Component, OnInit, Renderer2 } from '@angular/core';
import { Router } from '@angular/router';
import { DataStructure } from '@typings/DataStructure';
import { Subject, BehaviorSubject, Observable } from 'rxjs';
import { map, mergeAll, take, takeUntil, toArray } from 'rxjs/operators';
import { RestService } from 'src/app/service/rest.service';

@Component({
	selector: 'app-emote-list',
	templateUrl: './emote-list.component.html',
	styleUrls: ['./emote-list.component.scss'],
	styles: ['.selected-emote-card { opacity: 0 }'],
	animations: [
		trigger('emotes', [
			transition('* => *', [
				query('.is-emote-card:enter', [
					style({ opacity: 0, transform: 'translateX(-20em) translateY(-20em)' }),
					stagger(21, [
						animate('475ms ease-in-out', keyframes([
							style({ opacity: 0, offset: 0.475 }),
							style({ opacity: 1, transform: 'none', offset: 1 })
						]))
					])
				], { optional: true }),

				group([
					query('.is-emote-card:not(.selected-emote-card):leave', [
						style({ opacity: 1 }),
						stagger(-11.5, [
							animate('200ms', style({ transform: 'scale(0)' }))
						])
					], { optional: true }),

					query('.selected-emote-card', [
						style({ opacity: 1 }),
						animate('550ms', keyframes([
							style({ offset: 0, opacity: 1, transform: 'scale(1)' }),
							style({ offset: .2, transform: 'scale(.91)' }),
							style({ offset: .38, transform: 'scale(.64)' }),
							style({ offset: .44, transform: 'scale(.82)' }),

							style({ offset: 1, transform: 'scale(12) translateY(25%)', opacity: 0 })
						])),
					], { optional: true })
				])
			])
		])
	]
})
export class EmoteListComponent implements OnInit {
	destroyed = new Subject<any>().pipe(take(1)) as Subject<void>;
	selecting = new BehaviorSubject(false).pipe(takeUntil(this.destroyed)) as BehaviorSubject<boolean>;
	emotes = new BehaviorSubject<any>([]).pipe(takeUntil(this.destroyed)) as BehaviorSubject<DataStructure.Emote[]>;

	constructor(
		private restService: RestService,
		private renderer: Renderer2,
		private router: Router,
	) { }

	selectEmote(el: any, emote: any): void {
		this.selecting.next(true);
		this.renderer.addClass(el, 'selected-emote-card');
		this.emotes.next([]);

		setTimeout(() => {
			this.router.navigate(['emotes', 0]);
		}, 775);
	}

	getEmotes(): Observable<DataStructure.Emote> {
		return this.restService.Emotes.List().pipe(
			RestService.onlyResponse(),
			map(res => res.body ?? []),
			mergeAll()
		);
	}

	ngOnInit(): void {
		this.getEmotes().pipe(
			toArray(),
			map(emotes => this.emotes.next(emotes))
		).subscribe();
	}

}