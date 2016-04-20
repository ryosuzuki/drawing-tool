
import org.openkinect.freenect.*;
import org.openkinect.processing.*;
import muthesius.net.*;
import org.webbitserver.*;

KinectTracker tracker;
Kinect kinect;
WebSocketP5 server;

void setup() {
  size(640, 520);
  kinect = new Kinect(this);
  tracker = new KinectTracker();

  server = new WebSocketP5(this,8080);
}

void draw() {
  background(255);

  // Run the tracking analysis
  tracker.track();
  // Show the image
  tracker.display();

  // Let's draw the raw location
  PVector v1 = tracker.getPos();
  fill(50, 100, 250, 200);
  noStroke();
  ellipse(v1.x, v1.y, 20, 20);

  server.broadcast("" + v1 + "");


  // Let's draw the "lerped" location
  PVector v2 = tracker.getLerpedPos();
  fill(100, 250, 50, 200);
  noStroke();
  ellipse(v2.x, v2.y, 20, 20);

  // Display some info
  int t = tracker.getThreshold();
  fill(0);
  text("threshold: " + t + "    " +  "framerate: " + int(frameRate) + "    " +
    "UP increase threshold, DOWN decrease threshold", 10, 500);
}

// Adjust the threshold with key presses
void keyPressed() {
  int t = tracker.getThreshold();
  if (key == CODED) {
    if (keyCode == UP) {
      t+=5;
      tracker.setThreshold(t);
    } else if (keyCode == DOWN) {
      t-=5;
      tracker.setThreshold(t);
    }
  }
}


void stop(){
  server.stop();
}

void mousePressed(){
  server.broadcast("hello from processing!");
}

void websocketOnMessage(WebSocketConnection con, String msg){
  println(msg);
}

void websocketOnOpen(WebSocketConnection con){
  println("A client joined");
}

void websocketOnClosed(WebSocketConnection con){
  println("A client left");
}