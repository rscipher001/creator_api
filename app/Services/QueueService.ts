import Queue from 'bull'

const videoQueue = new Queue('video transcoding', 'redis://127.0.0.1:6379')
const audioQueue = new Queue('audio transcoding', {
  redis: { port: 6379, host: '127.0.0.1', password: 'foobared' },
}) // Specify Redis connection using object
const imageQueue = new Queue('image transcoding')
const pdfQueue = new Queue('pdf transcoding')

videoQueue.process(function (job, done) {
  // job.data contains the custom data passed when the job was created
  // job.id contains id of this job.

  // transcode video asynchronously and report progress
  job.progress(42)

  // call done when finished
  done()

  // or give a error if error
  done(new Error('error transcoding'))

  // or pass it a result
  done(null, { framerate: 29.5 /* etc... */ })

  // If the job throws an unhandled exception it is also handled correctly
  throw new Error('some unexpected error')
})

audioQueue.process(function (job, done) {
  // transcode audio asynchronously and report progress
  job.progress(42)

  // call done when finished
  done()

  // or give a error if error
  done(new Error('error transcoding'))

  // or pass it a result
  done(null, { samplerate: 48000 /* etc... */ })

  // If the job throws an unhandled exception it is also handled correctly
  throw new Error('some unexpected error')
})

imageQueue.process(function (job, done) {
  // transcode image asynchronously and report progress
  job.progress(42)

  // call done when finished
  done()

  // or give a error if error
  done(new Error('error transcoding'))

  // or pass it a result
  done(null, { width: 1280, height: 720 /* etc... */ })

  // If the job throws an unhandled exception it is also handled correctly
  throw new Error('some unexpected error')
})

pdfQueue.process(function (_) {
  // Processors can also return promises instead of using the done callback
  // return pdfAsyncProcessor()
})

videoQueue.add({ video: 'http://example.com/video1.mov' })
audioQueue.add({ audio: 'http://example.com/audio1.mp3' })
imageQueue.add({ image: 'http://example.com/image1.tiff' })
