import heapq

def a_star(graph, start, goal, h):
    open_list = [(h[start], 0, start, [])]
    closed_set = set()

    while open_list:
        f, g, node, path = heapq.heappop(open_list)

        if node in closed_set:
            continue

        path = path + [node]

        if node == goal:
            return path

        closed_set.add(node)

        for neighbor, cost in graph.get(node, []):
            if neighbor not in closed_set:
                new_g = g + cost
                new_f = new_g + h[neighbor]
                heapq.heappush(open_list, (new_f, new_g, neighbor, path))

    return None


graph = {
    'A': [('B', 2), ('C', 3)],
    'B': [('D', 1), ('E', 1)],
    'C': [('E', 3)],
    'D': [('G', 2)],
    'E': [('G', 4)],
    'G': []
}

h = {
    'A': 7,
    'B': 6,
    'C': 4,
    'D': 4,
    'E': 2,
    'G': 0
}

# Start and goal nodes
start, goal = 'A', 'G'

path = a_star(graph, start, goal, h)

print("Path found:", " -> ".join(path) if path else "No path found.")
import heapq

def a_star(graph, start, goal, h):
    open_list = [(h[start], 0, start, [])]
    closed_set = set()

    while open_list:
        f, g, node, path = heapq.heappop(open_list)

        if node in closed_set:
            continue

        path = path + [node]

        if node == goal:
            return path

        closed_set.add(node)

        for neighbor, cost in graph.get(node, []):
            if neighbor not in closed_set:
                new_g = g + cost
                new_f = new_g + h[neighbor]
                heapq.heappush(open_list, (new_f, new_g, neighbor, path))

    return None


graph = {
    'A': [('B', 2), ('C', 3)],
    'B': [('D', 1), ('E', 1)],
    'C': [('E', 3)],
    'D': [('G', 2)],
    'E': [('G', 4)],
    'G': []
}

h = {
    'A': 7,
    'B': 6,
    'C': 4,
    'D': 4,
    'E': 2,
    'G': 0
}

# Start and goal nodes
start, goal = 'A', 'G'

path = a_star(graph, start, goal, h)

print("Path found:", " -> ".join(path) if path else "No path found.")
