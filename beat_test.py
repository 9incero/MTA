import librosa
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.animation as animation

# Load the audio file using librosa
audio_path = 'data/music.wav'  # Replace with your audio file path
y, sr = librosa.load(audio_path)

# Compute the amplitude envelope
amplitude_env = np.abs(y)
times = np.arange(len(y)) / sr

# Initialize pygame mixer and load the audio
pygame.mixer.init()
pygame.mixer.music.load(audio_path)
pygame.mixer.music.play()

# Set up the plot
fig, ax = plt.subplots(figsize=(10, 6))
ax.plot(times, amplitude_env, label='Amplitude')
progress_line, = ax.plot([], [], 'k--', label='Progress')  # Initialize progress line
ax.set_xlim(0, times[-1])  # Set x-axis limits
ax.set_ylim(0, np.max(amplitude_env))  # Set y-axis limits
ax.set_xlabel('Time (s)')
ax.set_ylabel('Amplitude')
ax.set_title('Amplitude Envelope with Detected Onsets')
ax.legend()


def init():
	progress_line.set_data([], [])
	return progress_line,


def animate(frame):
	# Compute the current time based on the frame number
	current_time = frame / sr  # Convert frame to time

	# Debugging: Print current_time and frame values
	if frame % (len(y) // 10) == 0:  # Print every 10% of the frames
		print(f"Frame: {frame}, Time: {current_time}")

	# Update the progress line
	if current_time <= times[-1]:
		progress_line.set_data([current_time, current_time], [0, np.max(amplitude_env)])
	return progress_line,


# Total number of frames based on audio length
total_frames = len(y)

# Create animation
ani = animation.FuncAnimation(
	fig, animate, init_func=init, frames=total_frames, interval=1000 / sr, blit=True, repeat=False
)

plt.show()