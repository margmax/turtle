eval $.turtle() # Create the default turtle.

speed 100
for color in [red, gold, green, blue]
for sides in [3..6]
pen color
for x in [1..sides]
fd 100 / sides
lt 360 / sides
pen null
fd 40
slide 40, -160