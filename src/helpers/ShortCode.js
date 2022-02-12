class ShortCode {
  static fileParse(text) {
    const regex = /\[file[^\]]+url="([^"]*)"[^\]]*]([^[\]]*)/ig;
    const values = [];
    let match;
    // eslint-disable-next-line no-cond-assign
    while (match = regex.exec(text)) {
      values.push({
        url: match[1],
        name: match[2],
      });
    }
    return values;
  }

  static fileStringify(files) {
    if (!files) {
      return '';
    }
    return files.map((f) => `[file url="${f.url || ''}"]${f.name || ''}[/file]`).join(' ');
  }

  static linkParse(text) {
    const regex = /\[link[^\]]+url="([^"]*)"[^\]]*]([^[\]]*)/ig;
    const values = [];
    let match;
    // eslint-disable-next-line no-cond-assign
    while (match = regex.exec(text)) {
      values.push({
        url: match[1],
        name: match[2],
      });
    }
    return values;
  }

  static linkStringify(links) {
    if (!links) {
      return '';
    }
    return links.map((f) => `[link url="${f.url || ''}"]${f.name || ''}[/link]`).join(' ');
  }
}

export default ShortCode;
