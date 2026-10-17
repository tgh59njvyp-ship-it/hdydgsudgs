import test from 'node:test';
import assert from 'node:assert/strict';
import {
  parsePinterestBoardUrl,
  getOriginalImageUrl,
  inferFileExtension,
  formatSequentialFilename,
  formatZipFilename,
  deduplicatePins,
} from './pinterest-url.ts';
import type { PinterestPin } from '../types/index.ts';

test('parsePinterestBoardUrl: parses standard pinterest.jp URL', () => {
  const result = parsePinterestBoardUrl('https://www.pinterest.jp/username123/my-travel-board/');
  assert.equal(result.isValid, true);
  assert.equal(result.username, 'username123');
  assert.equal(result.boardSlug, 'my-travel-board');
});

test('parsePinterestBoardUrl: parses standard pinterest.com without trailing slash', () => {
  const result = parsePinterestBoardUrl('https://pinterest.com/designer/minimal-interior?invite_code=abc');
  assert.equal(result.isValid, true);
  assert.equal(result.username, 'designer');
  assert.equal(result.boardSlug, 'minimal-interior');
});

test('parsePinterestBoardUrl: rejects non-pinterest domain', () => {
  const result = parsePinterestBoardUrl('https://google.com/search?q=pinterest');
  assert.equal(result.isValid, false);
  assert.match(result.errorMessage || '', /PinterestのURLを入力してください/);
});

test('parsePinterestBoardUrl: rejects pin URL instead of board', () => {
  const result = parsePinterestBoardUrl('https://www.pinterest.jp/pin/1234567890/');
  assert.equal(result.isValid, false);
  assert.match(result.errorMessage || '', /ボード/);
});

test('parsePinterestBoardUrl: rejects single user profile URL', () => {
  const result = parsePinterestBoardUrl('https://www.pinterest.jp/username123/');
  assert.equal(result.isValid, false);
  assert.match(result.errorMessage || '', /ユーザー名とボード名が含まれている必要があります/);
});

test('getOriginalImageUrl: upgrades 236x and 736x to originals', () => {
  const thumbUrl = 'https://i.pinimg.com/236x/ab/cd/ef/abcdef123456.jpg';
  assert.equal(getOriginalImageUrl(thumbUrl), 'https://i.pinimg.com/originals/ab/cd/ef/abcdef123456.jpg');

  const largeUrl = 'https://i.pinimg.com/736x/11/22/33/11223344.png';
  assert.equal(getOriginalImageUrl(largeUrl), 'https://i.pinimg.com/originals/11/22/33/11223344.png');
});

test('inferFileExtension: detects correct extension from url or mime', () => {
  assert.equal(inferFileExtension('https://i.pinimg.com/originals/abc.png'), 'png');
  assert.equal(inferFileExtension('https://i.pinimg.com/originals/abc.jpg?v=1'), 'jpg');
  assert.equal(inferFileExtension('https://example.com/image', 'image/webp'), 'webp');
  assert.equal(inferFileExtension('https://example.com/image', 'image/png'), 'png');
  assert.equal(inferFileExtension('https://example.com/image', 'image/jpeg'), 'jpg');
});

test('formatSequentialFilename: pads numbers appropriately', () => {
  assert.equal(formatSequentialFilename(1, 45, 'https://i.pinimg.com/orig.jpg'), '001.jpg');
  assert.equal(formatSequentialFilename(99, 500, 'https://i.pinimg.com/orig.png'), '099.png');
  assert.equal(formatSequentialFilename(1234, 1500, 'https://i.pinimg.com/orig.webp'), '1234.webp');
});

test('formatZipFilename: formats board name with current date', () => {
  const fixedDate = new Date(2026, 9, 16); // 2026-10-16
  assert.equal(formatZipFilename('travel-board', fixedDate), 'travel-board_2026-10-16.zip');
  assert.equal(formatZipFilename('My / Cool : Board?', fixedDate), 'My_-_Cool_-_Board-_2026-10-16.zip');
});

test('deduplicatePins: removes duplicate image URLs', () => {
  const pins: PinterestPin[] = [
    {
      id: 'pin1',
      title: 'Pin 1',
      imageUrl: 'https://i.pinimg.com/236x/1.jpg',
      originalUrl: 'https://i.pinimg.com/originals/1.jpg',
    },
    {
      id: 'pin2',
      title: 'Pin 2 (dup)',
      imageUrl: 'https://i.pinimg.com/736x/1.jpg',
      originalUrl: 'https://i.pinimg.com/originals/1.jpg',
    },
    {
      id: 'pin3',
      title: 'Pin 3',
      imageUrl: 'https://i.pinimg.com/236x/2.jpg',
      originalUrl: 'https://i.pinimg.com/originals/2.jpg',
    },
  ];

  const unique = deduplicatePins(pins);
  assert.equal(unique.length, 2);
  assert.equal(unique[0].id, 'pin1');
  assert.equal(unique[1].id, 'pin3');
});
