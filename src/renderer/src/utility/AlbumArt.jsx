export class AlbumArt {
  constructor(options) {
    /*  releaseId,
    savePath,
    coverResponse,
    title,
    artist,
    barcode,
    country,
    date,
    labelInfo */
    (this.releaseId = options.releaseId),
      (this.savePath = options.savePath),
      (this.coverResponse = options.coverResponse),
      (this.title = options.title),
      (this.artist = options.artist),
      (this.barcode = options.barcode),
      (this.country = options.country),
      (this.date = options.date),
      (this.labelInfo = options.labelInfo);
  }
}
