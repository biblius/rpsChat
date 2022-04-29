import { ChatUser } from './interfaces';

export class RockPaperScissors {
    _id: string;
    _challenger: ChatUser;
    _challenged: ChatUser;
    _spectators: ChatUser[];

    challengerChoice?: 'r' | 'p' | 's' | 'kn';
    challengedChoice?: 'r' | 'p' | 's' | 'kn';

    challengerScore: number;
    challengedScore: number;

    challengerConn: boolean;
    challengedConn: boolean = false;

    fastMode: boolean = false;
    winnerName?: string

    gameOver: boolean = false;

    constructor(challenger: ChatUser, challenged: ChatUser) {
        this._id = (Math.random() * Math.pow(2, 32) * Date.now()).toString(16)
        this._challenger = challenger;
        this._challenged = challenged;
        this._spectators = [];
        this.challengedScore = 0;
        this.challengerScore = 0;
        this.challengerConn = true;
    }

    toggleFast() {
        this.fastMode = !this.fastMode;
    }

    chooseRPS(rps: 'r' | 'p' | 's' | 'kn', userId: string) {
        if (this.challenger.userID == userId) {
            this.challengerChoice = rps;
        }
        if (this.challenged.userID == userId) {
            this.challengedChoice = rps;
        }
    }

    resolveRPS(challengerChoice: string, challengedChoice: string): ChatUser | undefined {
        if (challengerChoice == challengedChoice) {
            return;
        }
        if (challengerChoice == 'kn' || challengedChoice == 'kn') {
            return challengerChoice == 'kn' ? this.challenger : this.challenged;
        }

        switch (challengerChoice) {
            case 'r':
                return challengedChoice == 's' ? this.challenger : this.challenged;
            case 'p':
                return challengedChoice == 'r' ? this.challenger : this.challenged;
            case 's':
                return challengedChoice == 'p' ? this.challenger : this.challenged;
            default:
                return;
        }
    }

    resetChoices() {
        delete this.challengerChoice;
        delete this.challengedChoice;
        delete this.winnerName;
    }

    addToSpectators(user: ChatUser) {
        if (!this.spectators.find(({ userID }) => user.userID == userID)) {
            this.spectators.push(user);
        }
    }

    disconnectPlayer(player: 'challenger' | 'challenged') {
        player == 'challenged' ? this.challengedConn = false : this.challengerConn = false;
        this.endGame();
    }

    endGame(): void {
        this.gameOver = true;
    }

    get challenger() {
        return this._challenger;
    }

    get challenged() {
        return this._challenged;
    }

    get spectators() {
        return this._spectators;
    }

    get id() {
        return this._id;
    }

}

export class RPSStore {

    rpsRooms!: RockPaperScissors[]

    constructor() {
        this.rpsRooms = [];
    }

    createRoom(rpsInstance: RockPaperScissors): void {
        this.rpsRooms.push(rpsInstance)
    }

    deleteRoom(room: RockPaperScissors): void {
        const index = this.rpsRooms.indexOf(room)!;
        this.rpsRooms.splice(index, 1);
    }

    getRooms(): RockPaperScissors[] {
        return this.rpsRooms
    }

    getRoom(roomId: string): RockPaperScissors | undefined {
        for (let i = 0; i < this.rpsRooms.length; i++) {
            const { _id } = this.rpsRooms[i];
            if (_id == roomId) return this.rpsRooms[i];
        };
        return undefined
    }

}