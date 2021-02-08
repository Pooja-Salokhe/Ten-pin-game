import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import * as $ from 'jquery';

@Component({
  selector: 'app-score-board',
  templateUrl: './score-board.component.html',
  styleUrls: ['./score-board.component.scss'],
})
export class ScoreBoardComponent implements OnInit {
  @ViewChild('scoresheetTable') scoresheetTable: ElementRef;
  noOfPinsKnockedDown = [];
  noOfFrames = [];
  noOfInputFields = [];
  noOfPins = 0;
  frames = [];
  framesLimit = 10;
  displayContent: string;
  frame = {
    pins: 0,
    rolls: [],
  };
  gameOverFlag = false;
  constructor() {}

  ngOnInit(): void {
    this.setNoOfPinsKonckedDown(0);
  }

  /**
   * This mwthod will register the number of pins tobe knocked down.
   */
  setNoOfPinsKonckedDown(pinsKnocked) {
    let data = [];
    for (let i = 0; i < 11 - pinsKnocked; i++) {
      data.push({
        pinValue: i,
        title: i === 0 ? 'No pin knocked down' : i + ' pin knocked down',
      });
    }

    this.noOfPinsKnockedDown = data;
  }

  /**
   * This method will register the value of  knocked down pin.@param pinNumber
   */
  knockedDownPinNumber(pinsKnocked: number) {
    if (this.frames.length === 0 || this.currFrameOver()) {
      this.frame = {
        pins: 10,
        rolls: [],
      };
      this.addFrame(this.frame);
      this.update(pinsKnocked, 1);
    } else {
      this.update(pinsKnocked, 2);
    }
    this.gameOver();
  }

  addFrame = function (frame) {
    this.frames.push(frame);
  };

  currFrameOver = function () {
    const currFrame = this.frames.length - 1;
    const currFrameRoll1 = this.frames[currFrame].rolls[0];
    const currFrameRoll2 = this.frames[currFrame].rolls[1];
    const currFrameRoll3 = this.frames[currFrame].rolls[2];

    if (this.frames.length === this.framesLimit) {
      return (
        currFrameRoll3 !== undefined ||
        currFrameRoll1 + currFrameRoll2 < this.frame.pins
      );
    } else {
      return currFrameRoll2 !== undefined || currFrameRoll1 === this.frame.pins;
    }
  };

  update(pinsKnocked, rollNo) {
    this.logRollResult(pinsKnocked);
    const currFrame = this.frames.length - 1;
    if (rollNo === 1) {
      this.selectRollDisplayContent1(pinsKnocked, currFrame);
    } else {
      this.selectRollDisplayContent2(pinsKnocked, currFrame);
    }
    this.updateGameScoreDisplay(currFrame);
    this.updateButtons(pinsKnocked, currFrame);
  }

  logRollResult = function (pinsKnocked) {
    this.frame.rolls.push(pinsKnocked);
  };

  /**
   * Check strike or not 
   * @param pinsKnocked 
   */
  strike(pinsKnocked) {
    return pinsKnocked === this.frame.pins;
  }

  /**
   * Check spare or not
   * @param currFrame 
   */
  spare(currFrame) {
    return (
      this.frames[currFrame].rolls[0] + this.frames[currFrame].rolls[1] ===
      this.frames[currFrame].pins
    );
  }
  selectRollDisplayContent1(pinsKnocked, currFrame) {
    if (this.strike(pinsKnocked) && this.frames.length < this.framesLimit) {
      this.updateRollDislay(1, currFrame, 'X');
    } else if (
      this.strike(pinsKnocked) &&
      this.frames.length === this.framesLimit
    ) {
      this.updateRollDislay(0, currFrame, 'X');
    } else {
      this.updateRollDislay(0, currFrame, pinsKnocked);
    }
  }

  updateRollDislay(position, currFrame, displayContent) {
    $(
      '#scoresheetTable tr:eq(1) td:eq(' + (currFrame * 2 + position) + ')'
    ).html(displayContent);
  }

  selectRollDisplayContent2(pinsKnocked, currFrame) {
    if (this.strike(pinsKnocked)) {
      this.displayContent = 'X';
    } else if (
      this.spare(currFrame) &&
      this.frames[currFrame].rolls.length < 3
    ) {
      this.displayContent = '/';
    } else {
      this.displayContent = pinsKnocked;
    }

    if (this.frames[currFrame].rolls.length < 3) {
      this.updateRollDislay(1, currFrame, this.displayContent);
    } else {
      this.updateRollDislay(2, currFrame, this.displayContent);
    }
  }

  /**
   * Update the score of each frame
   * @param currFrame 
   */
  updateGameScoreDisplay(currFrame) {
    let accumulator = 0;
    for (let i = 0; i < currFrame + 1; i++) {
      accumulator += this.frameScoreDisplay(i);
      if (this.frameScoreDisplay(i) != null) {
        document
          .getElementById('scoresheetTable')
          .getElementsByTagName('tr')[2]
          .getElementsByTagName('td')[i].innerHTML = accumulator.toString();
      }
    }
  }

  /**
   * This function will display score of each frame
   * @param frameNo 
   */
  frameScoreDisplay = function (frameNo) {
    let display = null;
    let nextFrameRoll1 = 0;
    let nextFrameRoll2 = 0;
    let nextNextFrame = 0;
    let nextNextFrameRoll1 = 0;
    let currFrameRoll1 = this.frames[frameNo].rolls[0];
    let currFrameRoll2 = this.frames[frameNo].rolls[1];
    let currFrameRoll3 = this.frames[frameNo].rolls[2];
    const currFrameTotal = this.total(this.frames[frameNo]);
    // const currFrameTotal = currFrameRoll1 + currFrameRoll2;

    const nextFrame = this.frames[frameNo + 1];
    if (nextFrame) {
      nextFrameRoll1 = this.frames[frameNo + 1].rolls[0];
    }
    if (nextFrame) {
      nextFrameRoll2 = this.frames[frameNo + 1].rolls[1];
    }
    nextNextFrame = this.frames[frameNo + 2];
    if (nextNextFrame) {
      nextNextFrameRoll1 = this.frames[frameNo + 2].rolls[0];
    }

    if (frameNo + 1 === this.framesLimit && currFrameRoll3) {
      display = currFrameTotal;
    } else if (currFrameRoll1 === this.frame.pins && nextFrame) {
      if (nextFrameRoll2) {
        display = currFrameTotal + nextFrameRoll1 + nextFrameRoll2;
      } else if (nextNextFrame) {
        display = currFrameTotal + nextFrameRoll1 + nextNextFrameRoll1;
      }
    } else if (
      currFrameRoll1 + currFrameRoll2 === this.frame.pins &&
      nextFrame
    ) {
      display = currFrameTotal + nextFrameRoll1;
    } else if (currFrameRoll1 + currFrameRoll2 < this.frame.pins) {
      display = currFrameTotal;
    }
    return display;
  };

  /**
   * Update th button based on pin knocked down
   * @param pinsKnocked 
   * @param currFrame 
   */
  updateButtons(pinsKnocked, currFrame) {
    if (
      this.currFrameOver() ||
      (this.frames.length === this.framesLimit &&
        !(
          this.frames[this.framesLimit - 1].rolls.length === 1 &&
          this.frames[this.framesLimit - 1].rolls[0] <
            this.frames[currFrame].pins
        ))
    ) {
      this.setNoOfPinsKonckedDown(0);
    } else {
      this.setNoOfPinsKonckedDown(pinsKnocked);
    }
  }

  /**
   * This method will calculate score of each frame
   * @param frame 
   */
  total(frame) {
    let runningTotal = 0;
    for (let i = 0; i < frame.rolls.length; i++) {
      runningTotal += frame.rolls[i];
    }
    return runningTotal;
  }

  /**
   * Game will end when frame length = 10
   */
  gameOver() {
    if (this.gameEnd()) {
      this.gameOverFlag = true;
    }
  }

  /**
   * Game will end when frame length = 10
   */
  gameEnd = function () {
    if (this.frames.length > this.framesLimit) {
      const finalFrameRoll1 = this.frames[this.framesLimit - 1].rolls[0];
      const finalFrameRoll2 = this.frames[this.framesLimit - 1].rolls[1];
      const finalFrameRoll3 = this.frames[this.framesLimit - 1].rolls[2];

      return (
        finalFrameRoll3 !== undefined ||
        finalFrameRoll1 + finalFrameRoll2 < this.frame.pins
      );
    }
  };

  /**
   * Start the new game
   */
  playAgain() {
    this.gameOverFlag = false;
    this.setNoOfPinsKonckedDown(0);
  }
}
