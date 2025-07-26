<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

// Your itch.io API key
$api_key = 'GiBiK7lzc7ix6fz5Z2jTd4oXSMEdEpjTKhXmoGqE';

function fetchItchioGames($api_key) {
    $context = stream_context_create([
        'http' => [
            'header' => "Authorization: Bearer " . $api_key . "\r\n"
        ]
    ]);
    
    // Get user's games
    $response = file_get_contents('https://itch.io/api/1/' . $api_key . '/my-games', false, $context);
    
    if ($response === FALSE) {
        return ['error' => 'Failed to fetch games from itch.io'];
    }
    
    $data = json_decode($response, true);
    
    if (!$data || !isset($data['games'])) {
        return ['error' => 'Invalid response from itch.io API'];
    }
    
    // Process and clean the games data
    $games = array_map(function($game) {
        return [
            'title' => $game['title'] ?? 'Untitled Game',
            'short_text' => $game['short_text'] ?? 'An exciting game experience.',
            'url' => $game['url'] ?? '#',
            'cover_url' => $game['cover_url'] ?? null,
            'min_price' => $game['min_price'] ?? 0,
            'classification' => $game['classification'] ?? 'Game',
            'type' => $game['type'] ?? 'Unknown',
            'published_at' => $game['published_at'] ?? null,
            'downloads_count' => $game['downloads_count'] ?? 0,
            'views_count' => $game['views_count'] ?? 0
        ];
    }, $data['games']);
    
    return [
        'success' => true,
        'games' => $games,
        'count' => count($games)
    ];
}

try {
    $result = fetchItchioGames($api_key);
    echo json_encode($result);
} catch (Exception $e) {
    echo json_encode([
        'error' => 'Server error: ' . $e->getMessage()
    ]);
}
?>
