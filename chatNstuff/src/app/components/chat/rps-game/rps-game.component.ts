import { Subscription } from 'rxjs';
import { MessageService } from './../../../services/message.service';
import { RockPaperScissors } from '../../../../../../backend/lib/rps';
import { ChatUser } from '../../../../../../backend/lib/interfaces';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-rps-game',
  templateUrl: './rps-game.component.html',
  styleUrls: ['./rps-game.component.css']
})
export class RpsGameComponent implements OnInit {
  @Input() activeUser!: ChatUser
  @Input() rpsGame!: RockPaperScissors;

  rps?: 'r' | 'p' | 's' | 'kn';

  showOpponentChoice: boolean = false;
  choiceFinalized: boolean = false;
  showWinnerBanner: boolean = false;
  winner?: string;
  winnerSub: Subscription;
  resetSub: Subscription;

  delSub!: Subscription;
  timeOut: number = 1500;

  pauseChoice: boolean = false;
  secretWord: string = '';
  kamenNajjaci: boolean = false;

  constructor(private messageService: MessageService) {
    this.winnerSub = this.messageService.winnerSubject.subscribe(winner => {
      this.winner = winner;
      this.showWinnerBanner = true;
      this.pauseChoice = true;
    })

    this.resetSub = this.messageService.resetSubject.subscribe(rps => {
      console.log('next works')
      this.rpsGame = rps;
      delete this.rps;
      delete this.winner;
      this.choiceFinalized = false;
      this.showWinnerBanner = false;
      this.pauseChoice = false;
    })
  }

  ngOnInit(): void {
    this.checkFinalized();
    console.log(this.userIs())
    console.log(this.rpsGame)
  }

  chooseRPS(choice: 'r' | 'p' | 's' | 'kn'): void {
    if (!this.pauseChoice && !this.choiceFinalized) {
      if (this.rps == choice) {
        delete this.rps;
        return;
      }
      this.rps = choice;
      if (this.rpsGame.fastMode) {
        this.submitRPS();
      }
    }
  }

  submitRPS(): void {
    if (this.rps && !this.choiceFinalized) {
      this.messageService.chooseRPS(this.rps, this.rpsGame._id);
      this.choiceFinalized = true;
    }
  }

  isInGame(user: ChatUser): boolean {
    if (this.rpsGame._challenger.userID == user.userID || this.rpsGame._challenged.userID == user.userID) {
      return true;
    }
    return false;
  }

  userIs(): 'challenger' | 'challenged' | 'spectator' | undefined {
    if (this.rpsGame._challenger.userID == this.activeUser.userID) return 'challenger';
    if (this.rpsGame._challenged.userID == this.activeUser.userID) return 'challenged';
    for (let i = 0; i < this.rpsGame._spectators.length; i++) {
      const { userID } = this.rpsGame._spectators[i];
      if (userID == this.activeUser.userID) {
        return 'spectator';
      }
    }
    return undefined;
  }

  toggleFast() {
    this.messageService.toggleFastMode(this.rpsGame._id);
  }

  onKey(event: KeyboardEvent) {
    if (this.rpsGame.fastMode && !this.choiceFinalized) {
      this.checkSecret(event.key)
    }

    switch (event.key) {
      case '1':
        this.chooseRPS('r')
        break;
      case '2':
        this.chooseRPS('p')
        break;
      case '3':
        this.chooseRPS('s')
        break;
      default:
        break;
    }
  }

  checkSecret(key: string) {
    const secret = 'kamennajjaci';
    this.secretWord += key;
    const regex = new RegExp(this.secretWord);
    console.log(this.secretWord)
    if (!regex.test(secret)) {
      this.secretWord = '';
      return;
    }
    if (this.secretWord == secret) {
      this.kamenNajjaci = !this.kamenNajjaci;
      console.log('kamen activated')
    }
  }

  checkFinalized() {
    if (this.userIs() == 'challenger') {
      if (this.rpsGame.challengerChoice) {
        this.rps = this.rpsGame.challengerChoice
        this.choiceFinalized = true;
        return;
      }
    }
    if (this.userIs() == 'challenged') {
      if (this.rpsGame.challengedChoice) {
        this.rps = this.rpsGame.challengedChoice
        this.choiceFinalized = true;
        return;
      }
    }
  }

  acceptChallenge(challenger: ChatUser) {
    this.messageService.acceptChallenge(challenger)
  }

  spectateGame(): void {
    this.messageService.spectateGame(this.rpsGame._id)
  }
}
