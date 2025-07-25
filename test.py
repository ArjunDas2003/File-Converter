# app.py

# For moviepy v2.x and newer, import classes directly from the main package
from moviepy import TextClip

print("Attempting to create a video with the updated moviepy script...")

try:
    # Create a simple text clip using the modern "fluent" API to chain methods
    clip = (TextClip("My setup works!", fontsize=70, color='white', size=(640, 480))
            .with_duration(3)  # Set duration using the .with_duration() method
            .with_fps(24))     # Set FPS using the .with_fps() method

    # Write the result to a video file
    clip.write_videofile("test_video.mp4")
    
    print("\n✅ Success! 'test_video.mp4' was created.")

except Exception as e:
    print(f"\n❌ An error occurred: {e}")
    print("\nCheck that FFmpeg is correctly installed and its 'bin' folder is in your system's PATH.")
