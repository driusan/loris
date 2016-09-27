namespace LORIS;

interface RequestHandler {
    /**
     * Handle a GET request
     */
    public function GET($params);

    /**
     * Handle a POST request
     */
    public function POST($params);
}