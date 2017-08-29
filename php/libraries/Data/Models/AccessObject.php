<?php
namespace LORIS\Data\Models;

use LORIS\Data\Models\TransferObject as DTO;
 
interface AccessObject
{
    /**
     * Instanciate and return a TransferObject matching the given primary key.
     *
     * @return DTO The requested object
     */
    public function getOne(array $primary_key);

    /**
     * Instanciate all available objects as TransferObject 
     *
     * @return array<DTO> An array of transfer object
     */
    public function getAll();

    /**
     * Update the database with new values 
     *
     * @param DTO $modifiedObject the modified object.
     *
     * @return void
     */
    public function save(DTO $modifiedObject);
}

