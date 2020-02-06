#!/usr/bin/env node
'use strict';
const colours = require('colorette');
const prettyBytes = require('pretty-bytes');
const icons = require('./icons');
const stdin = process.stdin;
const date = new Date();
const months = 'Jan Fed Mar Apr May Jun Jul Aug Sep Oct Nov Dec'.split(' ');
const now = {
  day: date.getDate(),
  month: months[date.getMonth()],
};

date.setTime(date.getTime - 24 * 60 * 60 * 1000);
now.day1 = date.getDate();
now.month1 = months[date.getMonth()];

const byteMultiplier = s => {
  return (
    {
      K: 1024 ,
      M: 1024 * 1024,
      G: 1024 * 1024 * 1024,
      T: 1024 * 1024 * 1024 * 1024,
    }[s] || 1
  );
};

const perms = /([drwx\-]{10,10}[@\+]{0,1})/;

const lineMatch = /([drwx\-]{10,10}[@\+]{0,1})\s+(\d+)\s+(\w+)\s+(\w+)\s+([\d\.KBMGT]+)\s+(\d+)\s+(\w+)\s+([\d:]+)\s(.*)/g;
let i = 0;

function col(s, condition, c, b) {
  if (!condition) return colours.dim(s);
  let res = colours[c](s);
  if (b) res = colours.bold(res);
  return res;
}

function line(line) {
  let match = false;
  let result = {};

  line.replace(
    lineMatch,
    (all, perms, blocks, user, group, size, day, month, year, filename) => {
      let [dir, ...rest] = perms.split('');

      const res = {};
      match = true;

      const permissions = [];
      const isDir = dir === 'd';
      if (!isDir) dir = '.';
      permissions.push(col(dir, isDir, 'blue', true));

      for (let i = 0; i <= 2 * ((rest.length / 3) | 0); i += 3) {
        permissions.push(col(rest[i], rest[i] !== '-', 'green', i < 3));
        permissions.push(
          col(rest[i + 1], rest[i + 1] !== '-', 'yellow', i + 1 < 3)
        );
        permissions.push(
          col(rest[i + 2], rest[i + 2] !== '-', 'red', i + 2 < 3)
        );
      }

      if (user === process.env.USER) {
        user = colours.green(user);
      }
      user = colours.dim(user);

      res.permissions = permissions.join('');
      res.user = user + ' ';

      // file size
      const sizeLastChr = size.slice(-1);
      let fileSize = parseFloat(size, 10);
      if (isNaN(parseInt(size.slice(-1), 10))) {
        fileSize = fileSize * byteMultiplier(sizeLastChr);
      }

      const [sl, sr] = prettyBytes(fileSize).split(' ');
      if (isDir) {
        res.size = null;
        res.sizeDelim = colours.dim('-');
      } else {
        res.size = sl;
        res.sizeDelim = sr;
      }

      day = parseInt(day, 10);

      if (year.includes(':')) {
        // recent

        if (day === now.day) {
          // + bold + bright
          day = colours.bold(colours.greenBright(day.toString()));
          month = colours.bold(colours.greenBright(month));
          year = colours.bold(colours.greenBright(year));
        } else if (day === now.day1 && now.month1 == month) {
          day = colours.greenBright(day.toString());
          month = colours.greenBright(month);
          year = colours.greenBright(year);
        } else {
          day = colours.dim(colours.green(day.toString()));
          month = colours.dim(colours.green(month));
          year = colours.dim(colours.green(year));
        }
      } else {
        day = colours.dim(colours.green(day.toString()));
        month = colours.dim(colours.green(month));
        year = colours.dim(colours.green(year));
      }

      res.day = day;
      res.month = month;
      res.year = year;

      if (isDir && filename.endsWith('/')) {
        filename = filename.slice(0, -1);
      }

      const ext = isDir ? filename : filename.split('.').pop();
      let icon = isDir ? icons.files.folder : icons.files.file;

      if (icons.files.hasOwnProperty(ext)) {
        icon = icons.files[ext];
      } else if (icons.fileAliases.hasOwnProperty(ext)) {
        icon = icons.files[icons.fileAliases[ext]];
      }

      if (isDir) {
        res.filename = colours.blue(`${icon} ${filename}/`);
      } else {
        res.filename = `${icon} ${filename}`;
      }

      result = res;
    }
  );

  if (!match) {
    if (line.length) {
      console.log(line);
    }
    return false;
  }
  return result;
}

if (stdin.isTTY) {
  console.log('Pipe `ls` to this command');
  process.exit(1);
}

if (!process.stdout.isTTY) {
  stdin.pipe(process.stdout);
  process.stdout.on('error', () => {}); // swallow in the expectation that piped will handle it
} else {
  let ret = '';
  stdin.setEncoding('utf8');
  stdin.on('readable', () => {
    let chunk;

    while ((chunk = stdin.read())) {
      ret += chunk;
    }
  });

  stdin.on('end', () => {
    main(ret);
  });
}

function main(str) {
  let res;

  if (perms.test(str)) {
    res = str
      .split('\n')
      .map(line)
      .filter(Boolean);
  } else {
    res = str.split('\n').map(_ => ({ filename: _ }));
  }

  const cols = require('columnify')(res, {
    showHeaders: false,
    config: {
      size: { align: 'right' },
      day: { align: 'right' },
      year: { align: 'right' },
      user: { minWidth: process.env.USER.length + 1 },
    },
  });

  console.log(
    cols
      .split('\n')
      .map(_ => _.trim())
      .filter(Boolean)
      .join('\n')
  );
}
